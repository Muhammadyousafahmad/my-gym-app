const Class = require('../models/Class');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const Notification = require('../models/Notification');

// Helper to notify a member of class booking/waitlist upgrade
const notifyMember = async (userId, classObj, type) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let title = '';
    let message = '';

    if (type === 'enroll') {
      title = `Class Booking Confirmed: ${classObj.name}`;
      message = `Hi ${user.name}, you are successfully booked for ${classObj.name} on ${new Date(classObj.startTime).toLocaleString()}. Room: ${classObj.room}.`;
    } else if (type === 'waitlist') {
      title = `Added to Waitlist: ${classObj.name}`;
      message = `Hi ${user.name}, you are currently on the waitlist for ${classObj.name} on ${new Date(classObj.startTime).toLocaleString()}. We will notify you if a spot opens up.`;
    } else if (type === 'upgrade') {
      title = `Waitlist Upgrade: ${classObj.name}`;
      message = `Good news, ${user.name}! A spot opened up in ${classObj.name} on ${new Date(classObj.startTime).toLocaleString()} and you have been moved from the waitlist to enrolled!`;
    }

    // Save in-app notification
    await Notification.create({
      recipient: user._id,
      title,
      message,
      type: 'All'
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject: title,
      text: message
    });

    // Send SMS
    if (user.phone) {
      await sendSMS(user.phone, message);
    }
  } catch (err) {
    console.error('Error in notifying member: ', err.message);
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('trainer', 'name email photo phone')
      .populate('enrolled', 'name email')
      .populate('waitlist', 'name email');

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
exports.getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('trainer', 'name email photo phone')
      .populate('enrolled', 'name email')
      .populate('waitlist', 'name email');

    if (!classObj) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/Admin/Trainer
exports.createClass = async (req, res) => {
  try {
    const { name, description, trainer, startTime, endTime, capacity, room } = req.body;

    // Verify trainer exists and is actually a trainer
    const trainerUser = await User.findOne({ _id: trainer, role: 'trainer' });
    if (!trainerUser) {
      return res.status(400).json({ success: false, error: 'Trainer not found' });
    }

    const classObj = await Class.create({
      name,
      description,
      trainer,
      startTime,
      endTime,
      capacity: capacity || 20,
      room: room || 'Main Studio'
    });

    res.status(201).json({
      success: true,
      data: classObj
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private/Admin/Trainer
exports.updateClass = async (req, res) => {
  try {
    let classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Role verification (Trainer can only update their own classes)
    if (req.user.role === 'trainer' && classObj.trainer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this class' });
    }

    classObj = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private/Admin/Trainer
exports.deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Role verification (Trainer can only delete their own classes)
    if (req.user.role === 'trainer' && classObj.trainer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this class' });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Enroll in a class
// @route   POST /api/classes/:id/enroll
// @access  Private/Member
exports.enrollInClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Check if already enrolled
    if (classObj.enrolled.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this class' });
    }

    // Check if on waitlist
    if (classObj.waitlist.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Already on the waitlist for this class' });
    }

    // Check capacity
    if (classObj.enrolled.length < classObj.capacity) {
      // Enroll directly
      classObj.enrolled.push(req.user.id);
      await classObj.save();
      await notifyMember(req.user.id, classObj, 'enroll');

      return res.status(200).json({
        success: true,
        message: 'Successfully enrolled in class',
        data: classObj
      });
    } else {
      // Add to waitlist
      classObj.waitlist.push(req.user.id);
      await classObj.save();
      await notifyMember(req.user.id, classObj, 'waitlist');

      return res.status(200).json({
        success: true,
        message: 'Class is full. Added to waitlist.',
        data: classObj
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Unenroll from a class
// @route   POST /api/classes/:id/unenroll
// @access  Private/Member
exports.unenrollFromClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Check if user is enrolled
    const enrolledIndex = classObj.enrolled.indexOf(req.user.id);
    const waitlistIndex = classObj.waitlist.indexOf(req.user.id);

    if (enrolledIndex > -1) {
      // Remove from enrolled list
      classObj.enrolled.splice(enrolledIndex, 1);

      // If waitlist has users, promote the first one to enrolled
      if (classObj.waitlist.length > 0) {
        const nextUserId = classObj.waitlist.shift(); // Remove first member in queue
        classObj.enrolled.push(nextUserId);
        
        // Notify the upgraded member
        await notifyMember(nextUserId, classObj, 'upgrade');
      }

      await classObj.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully unenrolled from class',
        data: classObj
      });
    } else if (waitlistIndex > -1) {
      // User is only on the waitlist, remove them
      classObj.waitlist.splice(waitlistIndex, 1);
      await classObj.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully removed from waitlist',
        data: classObj
      });
    } else {
      return res.status(400).json({ success: false, error: 'You are not enrolled or waitlisted for this class' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
