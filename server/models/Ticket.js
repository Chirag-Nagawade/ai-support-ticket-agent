const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Pending Info'],
    default: 'Open'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // AI Insights
  ai_summary: { type: String },
  priority: { type: String, default: 'Unassigned' },
  sentiment: { type: String, default: 'Neutral' },
  category: { type: String, default: 'General' },
  reason: { type: String },
  suggested_action: { type: String },
  resolution_time: { type: String, default: 'Unknown' },
  assigned_team: { type: String, default: 'Support Team' },
  similar_issues: { type: String },
  ai_response: { type: String },
  // Resolution & Communication details
  resolution_msg: { type: String }, // Final manual message from agent on resolution
  ai_resolution_msg: { type: String }, // Final AI response on resolution
  staff_message: { type: String }, // Query sent for "More Info"
  is_pending_user: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
