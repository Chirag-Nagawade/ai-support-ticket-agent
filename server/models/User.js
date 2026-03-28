const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  department: {
    type: String,
    enum: ['Billing Team', 'Technical Team', 'Account Team', 'Support Team'],
    required: function() { return this.role === 'agent'; }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
