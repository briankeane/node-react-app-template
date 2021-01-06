const { pubsub } = require('./pubsub.js');
const { events } = require('../lib/events');
const { withFilter } = require('apollo-server-express');

const resolvers = {
  Query: {
    songs: () => [], // replace with method to get songs
  },
  Subscription: {
    songUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([events.SONG_UPDATED]),
        (payload, variables) => payload.songUpdated.id === variables.songId
      ),
    },
  },
};

module.exports = resolvers;
