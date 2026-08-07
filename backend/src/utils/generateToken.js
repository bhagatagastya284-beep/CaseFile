const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};
