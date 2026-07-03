const express = require('express');
const router = express.Router();
const { getWorkoutPlans, getWorkoutPlanById, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } = require('../controllers/workoutPlanController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getWorkoutPlans);
router.get('/:id', protect, getWorkoutPlanById);

router.post('/', protect, authorize('admin', 'trainer'), upload.single('pdf'), createWorkoutPlan);
router.put('/:id', protect, authorize('admin', 'trainer'), upload.single('pdf'), updateWorkoutPlan);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteWorkoutPlan);

module.exports = router;
