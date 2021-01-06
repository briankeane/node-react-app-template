const stationEventHandlers = require('../lib/station/station.eventHandlers.js');
const graqhQLEventHandlers = require('../graphql/graphql.eventHandlers.js');

module.exports = {
  subscribeAll: () => {
    stationEventHandlers.subscribe();
    graqhQLEventHandlers.subscribe();
  },
};
