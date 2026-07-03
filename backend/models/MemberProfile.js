const mongoose = require('mongoose');

const MemberProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  membershipPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'none'],
    default: 'none'
  },
  subscriptionEnd: {
    type: Date
  },
  qrCodeUrl: {
    type: String
  },
  weightHistory: [{
    weight: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  height: {
    type: Number // in cm
  },
  fitnessGoal: {
    type: String,
    enum: ['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Maintain Fitness', 'Other'],
    default: 'Maintain Fitness'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MemberProfile', MemberProfileSchema);
