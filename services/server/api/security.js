const settings = require('../settings');
const jwt = require('express-jwt')({
  secret: settings.JWT_SECRET,
  algorithms: ['HS256'],
});

function authenticate(req, res, next) {
  if (req.headers.authorization === `Basic ${process.env.SERVICE_API_TOKEN}`) {
    return next();
  }
  jwt(req, res, (err) => {
    if (req.user) {
      return next();
    } else {
      let error = new Error('Invalid credentials');
      error.code = 'jwt';
      err.statusCode = 401;
      return next(err);
    }
  });
}

module.exports = {
  authenticate,
};
