const { SONG_UPDATED } = require('../lib/events/constants.js');
const events = require('../lib/events/constants.js');
const eventStream = require('../lib/eventStream');
const { pubsub } = require('./pubsub.js');

/*
 * Translate the RabbitMQ events into the appropriate
 * GraphQL pubsub event.
 */
const onSongUpdated = async (song) => {
  pubsub.publish(SONG_UPDATED, { songUpdate: song });
};

/*
 *
 */
const subscribe = () => {
  eventStream.songs.subscribe(events.SONG_UPDATED, onSongUpdated);
};

module.exports = {
  subscribe,
};
