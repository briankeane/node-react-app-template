const api = require('../api');
const db = require('../../../db');
const { logAndReturnError } = require('../../logger');

/*
 * Actual work goes here
 */
async function updateTokens({ oldTokens, newTokens }) {
  var spotifyUser = await db.models.SpotifyUser.findOne({ where: oldTokens });
  if (spotifyUser) {
    spotifyUser = await spotifyUser.update(newTokens);
  }
  return spotifyUser;
}

function getPlayolaUserSeed({ accessToken, refreshToken }) {
  return new Promise((resolve, reject) => {
    const finish = async function (playolaProfile) {
      // make sure the tokens are stored for future use
      const { email, spotifyUID } = playolaProfile;
      await db.models.SpotifyUser.findOrCreate({
        where: { email },
        defaults: { accessToken, refreshToken, spotifyUID },
      });
      return resolve(playolaProfile);
    };

    api
      .getMe({ accessToken, refreshToken })
      .then((profile) => finish(playolaProfileFromSpotifyProfile(profile)))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

/*
 * A User is automatically created anytime a SpotifyUser is created.
 */
async function createSpotifyUser({ accessToken, refreshToken }) {
  let rawProfile = await api.getMe({ accessToken, refreshToken });
  const spotifyUID = rawProfile['id'];
  const email = rawProfile['email'];
  const [spotifyUser, _] = await db.models.SpotifyUser.findOrCreate({
    where: { email },
    defaults: { accessToken, refreshToken, spotifyUID },
  });
  return spotifyUser;
}

/*
 * Note:  As of now, spotify only allows 50 max results for both
 * getRecentlyPlayedTracks and getUsersTopTracks.  In the future, we
 * may want to allow for pagination, but for now it does not matter
 */

function getRecentlyPlayedTracks({ email }) {
  return new Promise((resolve, reject) => {
    db.models.SpotifyUser.findOne({ where: { email } })
      .then((spotifyUser) =>
        api.getRecentlyPlayedTracks({
          accessToken: spotifyUser.accessToken,
          refreshToken: spotifyUser.refreshToken,
        })
      )
      .then((data) => resolve(data.items.map((item) => item.track)))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function getUsersTopTracks({ email }) {
  return new Promise((resolve, reject) => {
    db.models.SpotifyUser.findOne({ where: { email } })
      .then((spotifyUser) =>
        api.getUsersTopTracks({
          accessToken: spotifyUser.accessToken,
          refreshToken: spotifyUser.refreshToken,
        })
      )
      .then((data) => resolve(data.items))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function getUsersSavedTracks({ email, maxTrackCount = 1000 }) {
  async function _getUsersSavedTracks({
    accessToken,
    refreshToken,
    offset = 0,
    previouslyReceivedTracks = [],
  }) {
    const data = await api.getUsersSavedTracks({ accessToken, refreshToken, offset });
    const receivedTracks = data.items.map((item) => item.track);
    const newPreviouslyReceivedTracks = previouslyReceivedTracks.concat(receivedTracks);
    if (newPreviouslyReceivedTracks.length >= maxTrackCount || !data.next) {
      return newPreviouslyReceivedTracks;
    } else {
      return newPreviouslyReceivedTracks.concat(
        await _getUsersSavedTracks({
          accessToken,
          refreshToken,
          offset: offset + 50,
          previouslyReceivedTracks,
        })
      );
    }
  }

  return new Promise((resolve, reject) => {
    db.models.SpotifyUser.findOne({ where: { email } })
      .then((spotifyUser) =>
        _getUsersSavedTracks({
          accessToken: spotifyUser.accessToken,
          refreshToken: spotifyUser.refreshToken,
        })
      )
      .then((tracks) => resolve(tracks))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

async function getUserRelatedSongSeeds({ email, minimum = 150 }) {
  let [topTracks, savedTracks] = await Promise.all([
    getUsersTopTracks({ email }),
    getUsersSavedTracks({ email }),
  ]);
  var totalTracks = removeDuplicates(topTracks.concat(savedTracks));
  totalTracks = await padWithSimilarSongs({ tracks: totalTracks, minimum });
  return spotifyTracksToSongSeeds(totalTracks);
}

/*
 * Helper functions
 */
function playolaProfileFromSpotifyProfile(spotifyProfile) {
  return {
    displayName: spotifyProfile.display_name,
    email: spotifyProfile.email,
    spotifyUID: spotifyProfile.id,
    profileImageURL:
      spotifyProfile.images && spotifyProfile.images.length
        ? spotifyProfile.images[0].url
        : undefined,
  };
}

async function padWithSimilarSongs({ tracks, minimum = 150 }) {
  async function _padWithSimilarSongs({ tracks, minimum, artists = [] }) {
    if (tracks.length >= minimum) return tracks;
    const seed_artists = artists.slice(0, 5).map((artist) => artist.id);
    const data = await api.getRecommendedTracks({ seed_artists });
    const updatedTracks = removeDuplicates(tracks.concat(data.tracks));
    return await _padWithSimilarSongs({
      tracks: updatedTracks,
      minimum,
      artists: artists.slice(2),
    });
  }

  // produce on array of artists in order of their frequency
  function createArtistArray(tracks) {
    const artistInfo = {};
    for (let track of tracks) {
      if (!track['artists'] || !track['artists'].length) continue;
      let artist = track['artists'][0];
      if (!artistInfo[artist.id]) artistInfo[artist.id] = { artist, count: 0 };
      artistInfo[artist.id].count += 1;
    }
    const sortedArtistInfos = Object.values(artistInfo).sort((a, b) =>
      a.count < b.count ? 1 : -1
    );
    return sortedArtistInfos.map((info) => info.artist);
  }

  const artists = createArtistArray(tracks);
  return await _padWithSimilarSongs({ tracks, minimum, artists });
}

function removeDuplicates(tracks) {
  var alreadySeen = {};
  var dupesRemoved = [];
  for (let track of tracks) {
    if (!alreadySeen[track.id]) {
      alreadySeen[track.id] = true;
      dupesRemoved.push(track);
    }
  }
  return dupesRemoved;
}

function spotifyTracksToSongSeeds(tracks) {
  return tracks.map((track) => {
    return {
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      durationMS: track.duration_ms,
      popularity: track.popularity,
      isrc: track.external_ids ? track.external_ids.isrc : undefined,
      spotifyID: track.id,
      imageURL:
        track.album.images && track.album.images.length
          ? track.album.images[0].url
          : undefined,
    };
  });
}

module.exports = {
  createSpotifyUser,

  getPlayolaUserSeed,
  updateTokens,
  getRecentlyPlayedTracks,
  getUsersTopTracks,
  getUsersSavedTracks,

  /*
   * Expose for other "microservices"
   */
  getUserRelatedSongSeeds,
};
