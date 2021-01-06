const events = require('../events/constants');
const eventStream = require('../eventStream');
const lib = require('./station.lib');
const logger = require('../logger');
const db = require('../../db');

/*
 * When a user is created, create their songs.
 */
const onUserCreated = ({ user }) => {
  db.models.User.findByPk(user.id)
    .then((foundUser) => lib.initializeSongsForUser({ user: foundUser }))
    .catch((err) => logger.error(err));
};

/*
 * Api
 */
const subscribe = () => {
  eventStream.users.subscribe(events.USER_CREATED, onUserCreated);
};

module.exports = {
  subscribe,
};
