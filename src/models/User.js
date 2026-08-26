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
  agentAuthorization: {
    status: { type: String, enum: ['inactive', 'pending', 'active', 'expired', 'revoked', 'failed'], default: 'inactive' },
    payment_method: { type: String, default: 'upi' },
    authorization_type: { type: String, default: 'agentic_simulation' },
    provider: { type: String, default: 'razorpay' },
    authorization_reference: { type: String, default: null },
    razorpay_customer_id: { type: String, default: null },
    razorpay_token_id: { type: String, default: null },
    transaction_limit: { type: Number, default: 5000 },
    currency: { type: String, default: 'INR' },
    updated_at: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  transactions: [{
    payment_id: String,
    amount: Number,
    product_name: String,
    status: String,
    payment_mode: { type: String, default: 'RAZORPAY TEST MODE' },
    date: { type: Date, default: Date.now }
  }]
});

// Avoid OverwriteModelError in hot-reload environments
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
