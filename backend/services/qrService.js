const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateUserQRCode = async (userId) => {
  try {
    const dir = 'uploads/qrcodes';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `qr-${userId}.png`;
    const filePath = path.join(dir, fileName);
    
    // The QR data will be the userId string
    await QRCode.toFile(filePath, userId, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    // Return the relative path for serving
    return `uploads/qrcodes/${fileName}`;
  } catch (err) {
    console.error('Error generating QR Code: ', err.message);
    throw err;
  }
};

module.exports = { generateUserQRCode };
