const express = require('express');
const router = express.Router();
const { getDietPlans, getDietPlanById, createDietPlan, updateDietPlan, deleteDietPlan } = require('../controllers/dietPlanController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getDietPlans);
router.get('/:id', protect, getDietPlanById);

router.post('/', protect, authorize('admin', 'trainer'), upload.single('pdf'), createDietPlan);
router.put('/:id', protect, authorize('admin', 'trainer'), upload.single('pdf'), updateDietPlan);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteDietPlan);

module.exports = router;
