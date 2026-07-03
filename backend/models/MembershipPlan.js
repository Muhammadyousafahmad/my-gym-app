const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  durationInMonths: {
    type: Number,
    default: 1
  },
  features: [{
    type: String
  }],
  stripePriceId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
