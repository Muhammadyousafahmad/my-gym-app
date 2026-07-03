const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '10-12' }, // Can be a string like "10-12" or "to failure"
  weight: { type: String, default: '' }, // e.g. "50 kg" or "bodyweight"
  restSeconds: { type: Number, default: 60 },
  notes: { type: String }
});

const WorkoutPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a plan title'],
    trim: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercises: [ExerciseSchema],
  pdfUrl: {
    type: String // Optional local path to uploaded PDF
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
