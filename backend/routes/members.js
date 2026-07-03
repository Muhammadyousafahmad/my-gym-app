const express = require('express');
const router = express.Router();
const { getMembers, getMemberById, updateMemberStatus, getAssignedMembers } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getMembers);
router.get('/trainer/assigned', protect, authorize('trainer'), getAssignedMembers);
router.get('/:id', protect, authorize('admin', 'trainer'), getMemberById);
router.put('/:id/status', protect, authorize('admin'), updateMemberStatus);

module.exports = router;
