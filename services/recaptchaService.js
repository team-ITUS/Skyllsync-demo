const axios = require('axios');
const { log, warn, error, info } = require('../utils/logger');

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || 'YOUR_SECRET_KEY'; // Set in .env

/**
 * Verifies a reCAPTCHA v3 token with Google.
 * @param {string} token - The token received from frontend.
 * @param {string} [remoteip] - Optional user's IP address.
 * @returns {Promise<{success: boolean, score: number, action: string, errorCodes?: string[]}>}
 */
async function verifyRecaptcha(token, remoteip = undefined) {
  if (!token) {
    warn('reCAPTCHA token missing in verifyRecaptcha');
    return { success: false, score: 0, action: '', errorCodes: ['missing-input'] };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);
    if (remoteip) params.append('remoteip', remoteip);

    info('Sending reCAPTCHA verification request', { remoteip });

    const res = await axios.post('https://www.google.com/recaptcha/api/siteverify', params);
    const data = res.data;

    info('reCAPTCHA verification response', data);

    return {
      success: data.success,
      score: data.score || 0,
      action: data.action || '',
      errorCodes: data['error-codes'] || [],
    };
  } catch (err) {
    error('Error in verifyRecaptcha', { err: err.message });
    return { success: false, score: 0, action: '', errorCodes: ['api-error'] };
  }
}

module.exports = { verifyRecaptcha };