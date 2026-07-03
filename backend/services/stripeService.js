const Stripe = require('stripe');

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_1234567890';
  const isMock = secretKey.includes('mock');
  
  if (isMock) {
    return {
      isMock: true,
      checkout: {
        sessions: {
          create: async (params) => {
            console.log('--- MOCK STRIPE SESSION CREATION ---', params);
            const sessionId = `mock_sess_${Math.round(Math.random() * 1e12)}`;
            // We append a query param to bypass stripe verification for demo purposes
            const successUrl = params.success_url.replace('{CHECKOUT_SESSION_ID}', sessionId) + `&mock=true&planId=${params.metadata.planId}&memberId=${params.metadata.memberId}`;
            return {
              id: sessionId,
              url: successUrl
            };
          }
        }
      }
    };
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16' // or standard current version
  });
};

module.exports = { getStripeClient };
