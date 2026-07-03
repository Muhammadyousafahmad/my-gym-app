const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class' // Can be null for general gym check-in
  },
  date: {
    type: Date,
    default: Date.now
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['QR', 'Manual'],
    default: 'Manual'
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
