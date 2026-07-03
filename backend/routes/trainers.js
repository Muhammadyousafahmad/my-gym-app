const express = require('express');
const router = express.Router();
const { getTrainers, getTrainerById, createTrainer, deleteTrainer } = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getTrainers);
router.get('/:id', getTrainerById);
router.post('/', protect, authorize('admin'), upload.single('photo'), createTrainer);
router.delete('/:id', protect, authorize('admin'), deleteTrainer);

module.exports = router;
