const QRCode = require('qrcode');

/**
 * Generate a QR‑code data‑URL for the given identifier.
 *
 * @param {string} data - The string to encode (e.g., a MongoDB user ID).
 * @returns {Promise<string>} - Data‑URL containing the PNG image.
 */
async function generateUserQRCode(data) {
  try {
    const qrDataUrl = await QRCode.toDataURL(data);
    return qrDataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
}

module.exports = { generateUserQRCode };
