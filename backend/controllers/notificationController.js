const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Send custom announcement to all or specific users (Admin/Trainer only)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin/Trainer
exports.broadcastNotification = async (req, res) => {
  try {
    const { recipientId, title, message, channel } = req.body;

    let recipients = [];

    if (recipientId) {
      // Send to specific user
      const user = await User.findById(recipientId);
      if (user) recipients.push(user);
    } else {
      // Broadcast to all members
      recipients = await User.find({ role: 'member', status: 'active' });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'No active recipients found' });
    }

    // Process notification for each recipient
    const notificationPromises = recipients.map(async (user) => {
      // 1. Create In-App log
      await Notification.create({
        recipient: user._id,
        title,
        message,
        type: channel || 'In-App'
      });

      // 2. Email Channel
      if (channel === 'Email' || channel === 'All') {
        await sendEmail({
          to: user.email,
          subject: title,
          text: message
        });
      }

      // 3. SMS Channel
      if ((channel === 'SMS' || channel === 'All') && user.phone) {
        await sendSMS(user.phone, message);
      }
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      message: `Broadcasted to ${recipients.length} member(s) successfully.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
