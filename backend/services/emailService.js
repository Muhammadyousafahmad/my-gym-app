const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isMock = !process.env.SMTP_USER || process.env.SMTP_USER === 'mock_email@gmail.com';

  if (isMock) {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.text || options.html}`);
    console.log('-----------------------');
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const message = {
      from: process.env.EMAIL_FROM || 'Gym System <noreply@gymapp.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error, falling back to mock: ', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
