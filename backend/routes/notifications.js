const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, broadcastNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/broadcast', protect, authorize('admin', 'trainer'), broadcastNotification);

module.exports = router;
