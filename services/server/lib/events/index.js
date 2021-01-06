const events = require('./constants');

const subscribeAll = () => {
  // must use require to avoid circular dependency
  require('../station/station.eventHandlers').subscribe();
};

module.exports = {
  subscribeAll,

  events,
};
