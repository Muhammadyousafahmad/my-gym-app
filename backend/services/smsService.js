const twilio = require('twilio');

const sendSMS = async (to, body) => {
  const isMock = !process.env.TWILIO_ACCOUNT_SID || 
                 process.env.TWILIO_ACCOUNT_SID.startsWith('ACmock');

  if (isMock) {
    console.log('--- MOCK SMS SENT ---');
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log('---------------------');
    return { success: true, mock: true };
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`SMS sent: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('SMS error, falling back to mock: ', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
