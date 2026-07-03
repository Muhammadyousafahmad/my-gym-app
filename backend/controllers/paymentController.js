const { getStripeClient } = require('../services/stripeService');
const MembershipPlan = require('../models/MembershipPlan');
const MemberProfile = require('../models/MemberProfile');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get all membership plans
// @route   GET /api/payments/plans
// @access  Public
exports.getMembershipPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find();
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create checkout session for membership plan
// @route   POST /api/payments/checkout
// @access  Private/Member
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Membership plan not found' });
    }

    const stripe = getStripeClient();

    // Session URLs
    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payments?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payments?canceled=true`;

    let session;

    if (stripe.isMock) {
      // Create a simulated checkout session
      session = await stripe.checkout.sessions.create({
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          planId: plan._id.toString(),
          memberId: req.user.id
        }
      });
    } else {
      // Real Stripe subscription checkout session
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId, // Requires valid Stripe Price ID
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          planId: plan._id.toString(),
          memberId: req.user.id
        }
      });
    }

    res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Confirm and activate subscription under Mock Stripe settings
// @route   POST /api/payments/confirm-mock
// @access  Private/Member
exports.confirmMockSubscription = async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe.isMock) {
      return res.status(400).json({ success: false, error: 'Mock endpoints are disabled in production' });
    }

    const { planId } = req.body;
    const memberId = req.user.id;

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Set end date based on duration (durationInMonths)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

    // Create Subscription
    const subscription = await Subscription.create({
      member: memberId,
      plan: planId,
      startDate: new Date(),
      endDate,
      stripeSubscriptionId: `mock_sub_${Math.round(Math.random() * 1e12)}`,
      status: 'active'
    });

    // Update Member Profile
    await MemberProfile.findOneAndUpdate(
      { user: memberId },
      {
        membershipPlan: planId,
        subscriptionStatus: 'active',
        subscriptionEnd: endDate
      },
      { upsert: true }
    );

    // Create Payment Log
    const payment = await Payment.create({
      member: memberId,
      amount: plan.price,
      currency: 'usd',
      status: 'succeeded',
      stripePaymentIntentId: `mock_pi_${Math.round(Math.random() * 1e12)}`,
      invoiceUrl: '',
      plan: planId
    });

    res.status(200).json({
      success: true,
      message: 'Mock subscription activated successfully!',
      data: { subscription, payment }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Stripe Webhook handler for active payments/renewals
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const stripe = getStripeClient();
  if (stripe.isMock) {
    return res.status(200).send('Webhook ignored in mock mode');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Requires raw request body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { planId, memberId } = session.metadata;

      const plan = await MembershipPlan.findById(planId);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

      // Create subscription in DB
      await Subscription.create({
        member: memberId,
        plan: planId,
        startDate: new Date(),
        endDate,
        stripeSubscriptionId: session.subscription,
        status: 'active'
      });

      // Update Member profile
      await MemberProfile.findOneAndUpdate(
        { user: memberId },
        {
          membershipPlan: planId,
          subscriptionStatus: 'active',
          subscriptionEnd: endDate
        }
      );

      // Create Payment log
      await Payment.create({
        member: memberId,
        amount: session.amount_total / 100, // Stripe values are in cents
        currency: session.currency,
        status: 'succeeded',
        stripePaymentIntentId: session.payment_intent,
        plan: planId
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error: ', err.message);
    res.status(500).send('Internal Server Error');
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentsHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'member') {
      query = { member: req.user.id };
    }

    const payments = await Payment.find(query)
      .populate('member', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
