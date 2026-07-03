const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MemberProfile = require('../models/MemberProfile');
const TrainerProfile = require('../models/TrainerProfile');
const { generateUserQRCode } = require('../services/qrService');

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforgymmanagementapp2026', {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, dob, gender, fitnessGoal, height, weight, bio, certifications, specializations } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
      phone: phone || '',
      photo: req.file ? req.file.path.replace(/\\/g, '/') : 'uploads/profiles/default.png'
    });

    // Create profile based on role
    if (user.role === 'member') {
      const qrCodeUrl = await generateUserQRCode(user._id.toString());
      
      const profile = await MemberProfile.create({
        user: user._id,
        dob: dob || null,
        gender: gender || 'Prefer not to say',
        fitnessGoal: fitnessGoal || 'Maintain Fitness',
        height: height || null,
        qrCodeUrl: qrCodeUrl,
        weightHistory: weight ? [{ weight, date: new Date() }] : []
      });
    } else if (user.role === 'trainer') {
      await TrainerProfile.create({
        user: user._id,
        bio: bio || '',
        certifications: certifications || [],
        specializations: specializations || []
      });
    }

    // Create token
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'member') {
      profile = await MemberProfile.findOne({ user: user._id }).populate('membershipPlan');
    } else if (user.role === 'trainer') {
      profile = await TrainerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, dob, gender, fitnessGoal, height, weight, bio, certifications, specializations, emergencyContact } = req.body;

    const userFields = {};
    if (name) userFields.name = name;
    if (phone) userFields.phone = phone;
    if (req.file) {
      userFields.photo = req.file.path.replace(/\\/g, '/');
    }

    // Update User
    const user = await User.findByIdAndUpdate(req.user.id, userFields, {
      new: true,
      runValidators: true
    });

    let profile = null;
    if (user.role === 'member') {
      const profileFields = {};
      if (dob) profileFields.dob = dob;
      if (gender) profileFields.gender = gender;
      if (fitnessGoal) profileFields.fitnessGoal = fitnessGoal;
      if (height) profileFields.height = height;
      
      if (emergencyContact) {
        // Parse if sent as a JSON string from form-data
        profileFields.emergencyContact = typeof emergencyContact === 'string' 
          ? JSON.parse(emergencyContact) 
          : emergencyContact;
      }

      profile = await MemberProfile.findOne({ user: user._id });
      if (!profile) {
        // Fallback create if profile missing
        const qrCodeUrl = await generateUserQRCode(user._id.toString());
        profile = new MemberProfile({ user: user._id, qrCodeUrl });
      }

      if (dob) profile.dob = dob;
      if (gender) profile.gender = gender;
      if (fitnessGoal) profile.fitnessGoal = fitnessGoal;
      if (height) profile.height = height;
      if (profileFields.emergencyContact) profile.emergencyContact = profileFields.emergencyContact;

      if (weight) {
        profile.weightHistory.push({ weight, date: new Date() });
      }

      await profile.save();
    } else if (user.role === 'trainer') {
      const trainerFields = {};
      if (bio) trainerFields.bio = bio;
      
      if (certifications) {
        trainerFields.certifications = typeof certifications === 'string'
          ? JSON.parse(certifications)
          : certifications;
      }
      if (specializations) {
        trainerFields.specializations = typeof specializations === 'string'
          ? JSON.parse(specializations)
          : specializations;
      }

      profile = await TrainerProfile.findOneAndUpdate(
        { user: user._id },
        { $set: trainerFields },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
