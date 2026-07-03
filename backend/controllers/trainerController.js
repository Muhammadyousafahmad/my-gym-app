const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Public
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', status: 'active' });
    const profilePromises = trainers.map(async (trainer) => {
      const profile = await TrainerProfile.findOne({ user: trainer._id });
      return {
        ...trainer.toObject(),
        profile
      };
    });

    const trainersWithProfiles = await Promise.all(profilePromises);

    res.status(200).json({
      success: true,
      count: trainersWithProfiles.length,
      data: trainersWithProfiles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Public
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
    if (!trainer) {
      return res.status(404).json({ success: false, error: 'Trainer not found' });
    }

    const profile = await TrainerProfile.findOne({ user: trainer._id });

    res.status(200).json({
      success: true,
      data: {
        ...trainer.toObject(),
        profile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a trainer (Admin only)
// @route   POST /api/trainers
// @access  Private/Admin
exports.createTrainer = async (req, res) => {
  try {
    const { name, email, password, phone, bio, certifications, specializations, workingHours } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'trainer',
      phone: phone || '',
      photo: req.file ? req.file.path.replace(/\\/g, '/') : 'uploads/profiles/default.png'
    });

    // Create trainer profile
    const profile = await TrainerProfile.create({
      user: user._id,
      bio: bio || '',
      certifications: certifications ? (typeof certifications === 'string' ? JSON.parse(certifications) : certifications) : [],
      specializations: specializations ? (typeof specializations === 'string' ? JSON.parse(specializations) : specializations) : [],
      workingHours: workingHours ? (typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours) : { start: '06:00', end: '22:00' }
    });

    res.status(201).json({
      success: true,
      data: {
        ...user.toObject(),
        profile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a trainer (Admin only)
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
    if (!trainer) {
      return res.status(404).json({ success: false, error: 'Trainer not found' });
    }

    // Instead of deleting, we can suspend or delete user + profile
    await User.findByIdAndDelete(req.params.id);
    await TrainerProfile.findOneAndDelete({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
