const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  agentMandateActive: {
    type: Boolean,
    default: false
  },
  autonomousBudget: {
    type: Number,
    default: 5000 // Default AI auto-pay budget
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid OverwriteModelError in hot-reload environments
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
