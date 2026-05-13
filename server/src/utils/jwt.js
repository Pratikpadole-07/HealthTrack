const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Signs a payload with a JWT and returns the token.
 * @param {object} payload - The data to be encoded in the token.
 * @returns {string} The signed JWT.
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Verifies a JWT and returns the decoded payload.
 * @param {string} token - The JWT to verify.
 * @returns {object} The decoded payload.
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};