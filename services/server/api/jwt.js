const jwt = require('jsonwebtoken');
const errors = require('../lib/errors');
const settings = require('../settings');

function jwtUserFromPlayolaUser(user) {
  return user.toJSON();
}

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwt.sign(user.jwtRepr(), settings.JWT_SECRET, { algorithm: 'HS256' }, function (err, token) {
      if (!token) return reject(new Error(errors.FAILED_TO_GENERATE_TOKEN));
      return resolve(token);
    });
  });
}

module.exports = {
  generateToken,
  jwtUserFromPlayolaUser
};