const User = require('../models/User');
const MemberProfile = require('../models/MemberProfile');
const Class = require('../models/Class');
const WorkoutPlan = require('../models/WorkoutPlan');

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin
exports.getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' });
    const profilePromises = members.map(async (member) => {
      const profile = await MemberProfile.findOne({ user: member._id }).populate('membershipPlan');
      return {
        ...member.toObject(),
        profile
      };
    });

    const membersWithProfiles = await Promise.all(profilePromises);

    res.status(200).json({
      success: true,
      count: membersWithProfiles.length,
      data: membersWithProfiles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single member profile
// @route   GET /api/members/:id
// @access  Private/Admin/Trainer
exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    const profile = await MemberProfile.findOne({ user: member._id }).populate('membershipPlan');
    
    res.status(200).json({
      success: true,
      data: {
        ...member.toObject(),
        profile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update member status (Admin only)
// @route   PUT /api/members/:id/status
// @access  Private/Admin
exports.updateMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'member' },
      { status },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get trainer's assigned members
// @route   GET /api/members/trainer/assigned
// @access  Private/Trainer
exports.getAssignedMembers = async (req, res) => {
  try {
    // A member is assigned if they are enrolled in any class taught by this trainer, 
    // or if they have a workout/diet plan from this trainer.
    const classes = await Class.find({ trainer: req.user.id });
    const classMemberIds = classes.flatMap(c => c.enrolled);

    const workoutPlans = await WorkoutPlan.find({ trainer: req.user.id });
    const planMemberIds = workoutPlans.map(p => p.member);

    // Combine unique user IDs
    const uniqueMemberIds = [...new Set([...classMemberIds, ...planMemberIds])];

    const members = await User.find({ _id: { $in: uniqueMemberIds }, role: 'member' });
    const profilePromises = members.map(async (member) => {
      const profile = await MemberProfile.findOne({ user: member._id }).populate('membershipPlan');
      return {
        ...member.toObject(),
        profile
      };
    });

    const membersWithProfiles = await Promise.all(profilePromises);

    res.status(200).json({
      success: true,
      count: membersWithProfiles.length,
      data: membersWithProfiles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
