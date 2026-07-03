const express = require('express');
const router = express.Router();
const { getMembershipPlans, createCheckoutSession, confirmMockSubscription, stripeWebhook, getPaymentsHistory } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/plans', getMembershipPlans);
router.post('/checkout', protect, authorize('member'), createCheckoutSession);
router.post('/confirm-mock', protect, authorize('member'), confirmMockSubscription);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/history', protect, getPaymentsHistory);

module.exports = router;
