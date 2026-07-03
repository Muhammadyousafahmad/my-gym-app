const Attendance = require('../models/Attendance');
const User = require('../models/User');
const MemberProfile = require('../models/MemberProfile');
const Class = require('../models/Class');

// @desc    Check-in member (Manual or via QR Code scan)
// @route   POST /api/attendance/checkin
// @access  Private/Admin/Trainer
exports.checkInMember = async (req, res) => {
  try {
    const { memberId, classId, method } = req.body;

    if (!memberId) {
      return res.status(400).json({ success: false, error: 'Member ID is required' });
    }

    // Verify member exists
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ success: false, error: 'Invalid member ID' });
    }

    if (member.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Member account is suspended' });
    }

    // Verify member profile & subscription
    const profile = await MemberProfile.findOne({ user: memberId });
    if (!profile || profile.subscriptionStatus !== 'active') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: Member does not have an active subscription' 
      });
    }

    let status = 'Present';

    // If check-in is for a specific class, run scheduling check
    if (classId) {
      const classObj = await Class.findById(classId);
      if (!classObj) {
        return res.status(404).json({ success: false, error: 'Class not found' });
      }

      // Check if enrolled
      if (!classObj.enrolled.includes(memberId)) {
        return res.status(400).json({ success: false, error: 'Member is not enrolled in this class' });
      }

      // Determine if check-in is late (e.g. 15 minutes past class start time)
      const now = new Date();
      const startTime = new Date(classObj.startTime);
      const diffMs = now - startTime;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > 15) {
        status = 'Late';
      }
    }

    // Check if member already checked in today (for general or specific class)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const query = {
      member: memberId,
      date: { $gte: startOfToday, $lte: endOfToday }
    };

    if (classId) {
      query.class = classId;
    } else {
      query.class = { $exists: false };
    }

    const alreadyCheckedIn = await Attendance.findOne(query);
    if (alreadyCheckedIn) {
      return res.status(400).json({ success: false, error: 'Member already checked in for today' });
    }

    // Register check-in
    const attendance = await Attendance.create({
      member: memberId,
      class: classId || null,
      method: method || 'Manual',
      status
    });

    res.status(201).json({
      success: true,
      message: `Check-in successful! Member status: ${status}`,
      data: attendance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get attendance history logs
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'member') {
      query = { member: req.user.id };
    } else if (req.user.role === 'trainer') {
      // Trainers view logs for classes they teach
      const classes = await Class.find({ trainer: req.user.id });
      const classIds = classes.map(c => c._id);
      
      // Also show manual checkins if they have access, 
      // but narrow by trainer classes specifically
      query = { class: { $in: classIds } };
    }
    // Admin has query = {} (unfiltered)

    const logs = await Attendance.find(query)
      .populate('member', 'name email photo')
      .populate({
        path: 'class',
        select: 'name startTime endTime room',
        populate: {
          path: 'trainer',
          select: 'name'
        }
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
