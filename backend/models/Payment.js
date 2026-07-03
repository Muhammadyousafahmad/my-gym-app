const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['succeeded', 'failed', 'pending'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  invoiceUrl: {
    type: String
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
