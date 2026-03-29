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
        signal: AbortSignal.timeout(30000) // 30 second timeout for local model
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
      ...aiInsights,
      ai_summary: aiInsights.ai_summary || title
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
    
    if (role !== 'user' && role !== 'admin') {
      // Agents only see their department already handled by query if we wanted to restrict
      // But currently agents see their department.
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_msg, ai_resolution_msg, staff_message, is_pending_user } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (resolution_msg) ticket.resolution_msg = resolution_msg;
    if (ai_resolution_msg) ticket.ai_resolution_msg = ai_resolution_msg;
    
    // Handle "Request More Info" logic
    if (staff_message !== undefined) {
      ticket.staff_message = staff_message;
      if (staff_message) {
        ticket.is_pending_user = true;
        ticket.status = 'Pending Info';
      }
    }
    
    if (is_pending_user !== undefined) {
      ticket.is_pending_user = is_pending_user;
    }

    // Reset pending if resolved
    if (status === 'Resolved' || status === 'Closed') {
      ticket.is_pending_user = false;
    }

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
    
    // Count active tickets with 'Critical' priority
    const activeCriticalCount = await Ticket.countDocuments({
      priority: 'Critical',
      status: { $nin: ['Resolved', 'Closed'] }
    });

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ stats, priorityStats, activeCriticalCount });
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

const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Append the user's reply to the description
    const updatedDescription = ticket.description + `\n\n[USER CLARIFICATION]: ${replyMessage}`;
    ticket.description = updatedDescription;

    // Send the updated full text to the AI for re-evaluation
    let aiInsights = {};
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ticket: `${ticket.title}: ${updatedDescription}` }),
        signal: AbortSignal.timeout(30000)
      });
      if (response.ok) {
        aiInsights = await response.json();
      }
    } catch (aiError) {
      console.error('AI Re-evaluation failed:', aiError.message);
    }

    // Apply any new insights (e.g. escalated priority)
    Object.assign(ticket, aiInsights);

    // Reset ticket state to active
    ticket.status = 'Open';
    ticket.is_pending_user = false;

    await ticket.save();
    await ticket.populate('user', 'name email');

    res.json({ message: 'Ticket refiled successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSystemAlerts = async (req, res) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const THRESHOLDS = { 
      'Technical': 2, 
      'Security': 2, 
      'Billing': 4 
    };
    
    // Find all active negative tickets from last 15 mins across key categories
    const activeNegativeTickets = await Ticket.find({
      category: { $in: Object.keys(THRESHOLDS) },
      sentiment: 'Negative',
      status: { $nin: ['Resolved', 'Closed'] },
      createdAt: { $gte: fifteenMinutesAgo }
    }).populate('user', 'name');

    // Group by category to check thresholds
    const grouped = activeNegativeTickets.reduce((acc, ticket) => {
      acc[ticket.category] = acc[ticket.category] || [];
      acc[ticket.category].push(ticket);
      return acc;
    }, {});

    const activeAlerts = Object.keys(THRESHOLDS)
      .filter(cat => (grouped[cat]?.length || 0) >= THRESHOLDS[cat])
      .map(cat => ({
        category: cat,
        count: grouped[cat].length,
        impactedUsers: grouped[cat].map(t => t.user?.name || 'Unknown User'),
        lastDetected: grouped[cat][0].createdAt,
        type: cat === 'Security' ? 'BREACH' : cat === 'Billing' ? 'REVENUE' : 'OUTAGE'
      }));

    res.json({
      isOutage: activeAlerts.length > 0,
      activeAlerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTicket, getTickets, updateTicketStatus, getAdminStats, getResolutionTrends, replyToTicket, getSystemAlerts };
