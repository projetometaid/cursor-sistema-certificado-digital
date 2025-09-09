const jwt = require('jsonwebtoken');
const { env } = require('../../../config/settings');

function signToken(payload) {
  const secret = env.jwtSecret || process.env.JWT_SECRET || 'dev';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

module.exports = { signToken };


