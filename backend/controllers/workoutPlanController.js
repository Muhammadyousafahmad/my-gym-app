const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');

// @desc    Get workout plans
// @route   GET /api/workout-plans
// @access  Private
exports.getWorkoutPlans = async (req, res) => {
  try {
    let query = {};

    // Members see only their own workout plans
    if (req.user.role === 'member') {
      query = { member: req.user.id, status: 'active' };
    } else if (req.user.role === 'trainer') {
      // Trainers see plans they created or plans assigned to their members
      query = { trainer: req.user.id };
    }

    const plans = await WorkoutPlan.find(query)
      .populate('trainer', 'name email photo')
      .populate('member', 'name email photo phone');

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single workout plan
// @route   GET /api/workout-plans/:id
// @access  Private
exports.getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate('trainer', 'name email photo')
      .populate('member', 'name email photo phone');

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Workout plan not found' });
    }

    // Authorization check
    if (req.user.role === 'member' && plan.member._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this plan' });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create workout plan
// @route   POST /api/workout-plans
// @access  Private/Admin/Trainer
exports.createWorkoutPlan = async (req, res) => {
  try {
    const { title, member, exercises, notes } = req.body;

    // Verify member exists
    const memberUser = await User.findOne({ _id: member, role: 'member' });
    if (!memberUser) {
      return res.status(400).json({ success: false, error: 'Member not found' });
    }

    // Process exercises if sent as stringified json from multipart form-data
    let parsedExercises = exercises;
    if (typeof exercises === 'string') {
      parsedExercises = JSON.parse(exercises);
    }

    const planFields = {
      title,
      trainer: req.user.id,
      member,
      exercises: parsedExercises || [],
      notes: notes || ''
    };

    if (req.file) {
      planFields.pdfUrl = req.file.path.replace(/\\/g, '/');
    }

    const plan = await WorkoutPlan.create(planFields);

    // Notify member
    const notifyTitle = `New Workout Plan: ${title}`;
    const notifyMsg = `Hi ${memberUser.name}, trainer ${req.user.name} has created a new workout plan for you. Check it out in your dashboard!`;

    await Notification.create({
      recipient: memberUser._id,
      title: notifyTitle,
      message: notifyMsg,
      type: 'All'
    });

    await sendEmail({
      to: memberUser.email,
      subject: notifyTitle,
      text: notifyMsg
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update workout plan
// @route   PUT /api/workout-plans/:id
// @access  Private/Admin/Trainer
exports.updateWorkoutPlan = async (req, res) => {
  try {
    let plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Workout plan not found' });
    }

    // Authorization check
    if (req.user.role === 'trainer' && plan.trainer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this plan' });
    }

    const { title, exercises, notes, status } = req.body;
    const planFields = {};
    if (title) planFields.title = title;
    if (notes) planFields.notes = notes;
    if (status) planFields.status = status;
    
    if (exercises) {
      planFields.exercises = typeof exercises === 'string' ? JSON.parse(exercises) : exercises;
    }

    if (req.file) {
      planFields.pdfUrl = req.file.path.replace(/\\/g, '/');
    }

    plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, { $set: planFields }, { new: true });

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete workout plan
// @route   DELETE /api/workout-plans/:id
// @access  Private/Admin/Trainer
exports.deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Workout plan not found' });
    }

    if (req.user.role === 'trainer' && plan.trainer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this plan' });
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
