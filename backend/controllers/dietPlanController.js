const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');

// @desc    Get diet plans
// @route   GET /api/diet-plans
// @access  Private
exports.getDietPlans = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'member') {
      query = { member: req.user.id, status: 'active' };
    } else if (req.user.role === 'trainer') {
      query = { trainer: req.user.id };
    }

    const plans = await DietPlan.find(query)
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

// @desc    Get single diet plan
// @route   GET /api/diet-plans/:id
// @access  Private
exports.getDietPlanById = async (req, res) => {
  try {
    const plan = await DietPlan.findById(req.params.id)
      .populate('trainer', 'name email photo')
      .populate('member', 'name email photo phone');

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Diet plan not found' });
    }

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

// @desc    Create diet plan
// @route   POST /api/diet-plans
// @access  Private/Admin/Trainer
exports.createDietPlan = async (req, res) => {
  try {
    const { title, member, meals, caloriesTarget, proteinTarget, carbsTarget, fatTarget, notes } = req.body;

    const memberUser = await User.findOne({ _id: member, role: 'member' });
    if (!memberUser) {
      return res.status(400).json({ success: false, error: 'Member not found' });
    }

    let parsedMeals = meals;
    if (typeof meals === 'string') {
      parsedMeals = JSON.parse(meals);
    }

    const planFields = {
      title,
      trainer: req.user.id,
      member,
      meals: parsedMeals || [],
      caloriesTarget: caloriesTarget || 2000,
      proteinTarget: proteinTarget || 150,
      carbsTarget: carbsTarget || 200,
      fatTarget: fatTarget || 65,
      notes: notes || ''
    };

    if (req.file) {
      planFields.pdfUrl = req.file.path.replace(/\\/g, '/');
    }

    const plan = await DietPlan.create(planFields);

    const notifyTitle = `New Diet Plan: ${title}`;
    const notifyMsg = `Hi ${memberUser.name}, trainer ${req.user.name} has created a new diet plan for you. Check it out in your dashboard!`;

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

// @desc    Update diet plan
// @route   PUT /api/diet-plans/:id
// @access  Private/Admin/Trainer
exports.updateDietPlan = async (req, res) => {
  try {
    let plan = await DietPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Diet plan not found' });
    }

    if (req.user.role === 'trainer' && plan.trainer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this plan' });
    }

    const { title, meals, caloriesTarget, proteinTarget, carbsTarget, fatTarget, notes, status } = req.body;
    const planFields = {};
    if (title) planFields.title = title;
    if (notes) planFields.notes = notes;
    if (status) planFields.status = status;
    if (caloriesTarget) planFields.caloriesTarget = caloriesTarget;
    if (proteinTarget) planFields.proteinTarget = proteinTarget;
    if (carbsTarget) planFields.carbsTarget = carbsTarget;
    if (fatTarget) planFields.fatTarget = fatTarget;

    if (meals) {
      planFields.meals = typeof meals === 'string' ? JSON.parse(meals) : meals;
    }

    if (req.file) {
      planFields.pdfUrl = req.file.path.replace(/\\/g, '/');
    }

    plan = await DietPlan.findByIdAndUpdate(req.params.id, { $set: planFields }, { new: true });

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete diet plan
// @route   DELETE /api/diet-plans/:id
// @access  Private/Admin/Trainer
exports.deleteDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Diet plan not found' });
    }

    if (req.user.role === 'trainer' && plan.trainer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this plan' });
    }

    await DietPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
