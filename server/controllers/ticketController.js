const Ticket = require('../models/Ticket');

const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Call Python AI Service
    let aiInsights = {
      priority: 'Medium',
      sentiment: 'Neutral',
      category: 'General',
      assigned_team: 'Support Team',
      ai_response: `Thank you for your request regarding "${title}". Our team is investigating this for you.`
    };
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ticket: `${title}: ${description}` }),
        signal: AbortSignal.timeout(10000) // 10 second timeout for local model
      });
      if (response.ok) {
        const result = await response.json();
        aiInsights = { ...aiInsights, ...result };
      }
    } catch (aiError) {
      console.error('AI Engine unreachable, using custom fallback:', aiError.message);
    }



    const newTicket = new Ticket({
      title,
      description,
      user: req.user.userId,
      ...aiInsights
    });

    await newTicket.save();
    
    // Populate user info so the frontend shows "By: Name" immediately
    await newTicket.populate('user', 'name email');

    res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const { role, department, userId } = req.user;
    let query = {};

    if (role === 'user') {
      query = { user: userId };
    } else if (role === 'agent') {
      query = { assigned_team: department };
    }

    // Sort: High priority first, then date.
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3, 'Unassigned': 4 };
    let tickets = await Ticket.find(query).populate('user', 'name email').sort({ createdAt: -1 });
    
    if (role !== 'user') {
      tickets.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_msg, ai_resolution_msg } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    if (resolution_msg) ticket.resolution_msg = resolution_msg;
    if (ai_resolution_msg) ticket.ai_resolution_msg = ai_resolution_msg;

    await ticket.save();

    res.json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ stats, priorityStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getResolutionTrends = async (req, res) => {
  try {
    // Last 30 days daily trends
    const dayTrends = await Ticket.aggregate([
      { $match: { status: 'Resolved' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          solved: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);

    // Monthly trends for the year
    const monthTrends = await Ticket.aggregate([
      { $match: { status: 'Resolved' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          solved: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ dayTrends, monthTrends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTicket, getTickets, updateTicketStatus, getAdminStats, getResolutionTrends };
