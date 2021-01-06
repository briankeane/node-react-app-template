const db = require('../../db');
const eventStream = require('../eventStream');
const { events } = require('../events');
const { Op, UniqueConstraintError } = require('sequelize');
const spotifyLib = require('../spotify/lib/spotify.lib');
const { SONG_UPDATED } = require('../events/constants');

function updateSong(songId, attrs) {
  return new Promise((resolve, reject) => {
    function finish(song) {
      eventStream.songs.publish(events.SONG_UPDATED, { song });
      return resolve(song);
    }
    db.models.Song.findByPk(songId)
      .then((oldSong) => oldSong.update(attrs))
      .then((updatedSong) => finish(updatedSong))
      .catch((err) => reject(err));
  });
}
function createSong(attrs) {
  return new Promise((resolve, reject) => {
    function finish([song, created]) {
      if (created) eventStream.songs.publish(events.SONG_CREATED, { song });
      return resolve(song);
    }

    const where = { [Op.or]: [{ spotifyID: attrs.spotifyID }, { isrc: attrs.isrc }] };
    db.models.Song.findOrCreate({ where, defaults: attrs })
      .then(async ([song, created]) =>
        created ? [song, created] : [await song.update(attrs), created]
      )
      .then((result) => finish(result))
      .catch(async (err) => {
        if (err instanceof UniqueConstraintError) {
          let consolidatedSong = await consolidateSongs({ where, newSongAttrs: attrs });
          return finish([consolidatedSong, false]);
        }
        throw err;
      })
      .catch((err) => reject(err));
  });
}

function findOrCreateSongsForUser({ email }) {
  return new Promise((resolve, reject) => {
    spotifyLib.getUserRelatedSongSeeds({ email }).then((songSeeds) => {
      let songPromises = songSeeds.map((seed) => createSong(seed));
      Promise.allSettled(songPromises).then((results) => {
        let fulfilledResults = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);
        resolve(fulfilledResults);
      });
    });
  });
}

function initializeSongsForUser({ user }) {
  return new Promise((resolve, reject) => {
    function finish({ user, userSongs }) {
      eventStream.stations.publish(events.STATION_SONGS_INITIALIZED, { user });
      return resolve({ user, userSongs });
    }

    function classifyAndSaveUserSongs(songs) {
      return new Promise((resolve, reject) => {
        const userSongData = songs.map((song) => ({ songId: song.id, userId: user.id }));

        // set the 1st 10 userSongs to 'primary'
        for (let i = 0; i < userSongData.length; i++) {
          userSongData[i].status = i < 10 ? 'primary' : 'secondary';
        }

        db.models.UserSong.bulkCreate(userSongData)
          .then(() =>
            db.models.UserSong.findAll({
              where: { userId: user.id },
              include: [{ model: db.models.Song }, { model: db.models.User }],
            })
          )
          .then((userSongs) => resolve(userSongs))
          .catch((err) => reject(err));
      });
    }

    findOrCreateSongsForUser({ email: user.email })
      .then((songs) => classifyAndSaveUserSongs(songs))
      .then((userSongs) => finish({ userSongs, user }))
      .catch((err) => reject(err));
  });
}

/*
 * Helper methods
 */

async function consolidateSongs({ where, newSongAttrs }) {
  function finish(updatedSong, deletedIDs) {
    eventStream.songs.publish(events.SONG_CONSOLIDATED, { deletedIDs, updatedSong });
    return updatedSong;
  }

  let songs = await db.models.Song.findAll({ where });
  let firstSong = songs.shift();
  let combinedOtherSongInfos = Object.assign(
    {},
    songs.map((song) => song.toJSON())
  );
  const deletedIDs = songs.map((song) => song.id);
  songs.forEach(async (song) => await song.destroy());
  await firstSong.update({
    ...combinedOtherSongInfos,
    ...newSongAttrs,
  });
  return finish(firstSong, deletedIDs);
}

module.exports = {
  createSong,
  updateSong,
  initializeSongsForUser,
};
