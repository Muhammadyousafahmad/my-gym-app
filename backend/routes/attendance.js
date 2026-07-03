const express = require('express');
const router = express.Router();
const { checkInMember, getAttendanceHistory } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/checkin', protect, authorize('admin', 'trainer'), checkInMember);
router.get('/', protect, getAttendanceHistory);

module.exports = router;
