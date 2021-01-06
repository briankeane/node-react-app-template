var sharedSettings = require('./shared.settings.js');

var environmentSpecficSettings = require(`./${process.env.NODE_ENV}.settings.js`);

module.exports = {
  ...sharedSettings,
  ...environmentSpecficSettings
};