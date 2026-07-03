const mongoose = require('mongoose');

const TrainerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  certifications: [{
    type: String
  }],
  specializations: [{
    type: String,
    enum: ['Weight Loss', 'Bodybuilding', 'Cardio & Endurance', 'Yoga & Flexibility', 'Strength & Conditioning', 'Rehabilitation']
  }],
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  workingHours: {
    start: {
      type: String,
      default: '06:00'
    },
    end: {
      type: String,
      default: '22:00'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TrainerProfile', TrainerProfileSchema);
