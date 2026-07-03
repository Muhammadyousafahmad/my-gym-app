const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g. "08:00 AM" or "Breakfast"
  foodItems: { type: String, required: true }, // e.g. "4 egg whites, 1 cup oats"
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // in grams
  carbs: { type: Number, default: 0 }, // in grams
  fat: { type: Number, default: 0 } // in grams
});

const DietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a diet plan title'],
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
  meals: [MealSchema],
  pdfUrl: {
    type: String // Optional local path to uploaded PDF
  },
  caloriesTarget: {
    type: Number,
    default: 2000
  },
  proteinTarget: {
    type: Number,
    default: 150
  },
  carbsTarget: {
    type: Number,
    default: 200
  },
  fatTarget: {
    type: Number,
    default: 65
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

module.exports = mongoose.model('DietPlan', DietPlanSchema);
