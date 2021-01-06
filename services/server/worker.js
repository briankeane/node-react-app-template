const eventStream = require('./eventStream');
const logger = require('./lib/logger');

eventStream
  .connect()
  .then(() => logger.log('Worker '))
  .catch((err) => logger.log(`Services event stream error: ${err.message}`));
