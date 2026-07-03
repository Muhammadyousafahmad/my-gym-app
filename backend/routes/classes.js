const express = require('express');
const router = express.Router();
const { getClasses, getClassById, createClass, updateClass, deleteClass, enrollInClass, unenrollFromClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getClasses);
router.get('/:id', getClassById);

router.post('/', protect, authorize('admin', 'trainer'), createClass);
router.put('/:id', protect, authorize('admin', 'trainer'), updateClass);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteClass);

router.post('/:id/enroll', protect, authorize('member'), enrollInClass);
router.post('/:id/unenroll', protect, authorize('member'), unenrollFromClass);

module.exports = router;
