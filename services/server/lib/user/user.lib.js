const db = require('../../db');
const eventStream = require('../eventStream');
const spotifyLib = require('../spotify/lib/spotify.lib');
const { events } = require('../events');
const errors = require('../errors');

const createUserViaSpotifyRefreshToken = async function ({ refreshToken }) {
  function finish(user, created) {
    if (created) eventStream.users.publish(events.USER_CREATED, { user });
    return user;
  }
  let profile = await spotifyLib.getPlayolaUserSeed({ refreshToken });
  const [user, created] = await db.models.User.findOrCreate({
    where: { email: profile.email },
    defaults: cleanUserSeed(profile),
  });
  return finish(user, created);
};

const getUserSongsForUser = function ({ userId }) {
  return new Promise((resolve, reject) => {
    db.models.UserSong.findAll({ where: { userId }, include: db.models.Song })
      .then((userSongs) => resolve(userSongs))
      .catch((err) => reject(err));
  });
};

const getUser = function ({ userId }) {
  return new Promise((resolve, reject) => {
    db.models.User.findByPk(userId)
      .then((user) => {
        if (!user) throw new Error(errors.USER_NOT_FOUND);
        return resolve(user);
      })
      .catch((err) => reject(err));
  });
};

function cleanUserSeed(seed) {
  return {
    displayName: seed.displayName,
    email: seed.email,
    profileImageURL: seed.profileImageURL,
  };
}

module.exports = {
  createUserViaSpotifyRefreshToken,
  getUserSongsForUser,
  getUser,
};
