const axios = require('axios');
const settings = require('../../../settings');
const { logAndReturnError } = require('../../logger');
const authHeader =
  'Basic ' +
  Buffer.from(settings.SPOTIFY_CLIENT_ID + ':' + settings.SPOTIFY_CLIENT_SECRET).toString(
    'base64'
  );
const TokenExchange = require('../tokenExchange');
const { performExponentialBackoff } = require('../../utils');
const db = require('../../../db');
const api = axios.create({
  baseURL: 'https://api.spotify.com',
  headers: { Authorization: authHeader },
});

api.interceptors.response.use(
  async (response) => {
    // if the accessToken was refreshed, refresh on db if necessary
    const { __newAccessToken, __refreshToken } = response.config;
    if (__newAccessToken) {
      await db.models.SpotifyUser.update(
        { accessToken: __newAccessToken },
        { where: { refreshToken: __refreshToken } }
      );
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      let responseBody = await TokenExchange.refreshTokens({
        refresh_token: error.config.__refreshToken,
      });
      error.config.__newAccessToken = responseBody.access_token;
      error.config.headers['Authorization'] = `Bearer ${responseBody.access_token}`;
      return api.request(error.config);
    } else if (
      error.response.status === 429 ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT'
    ) {
      return performExponentialBackoff(api, error);
    }
    return Promise.reject(error);
  }
);

function getMe({ accessToken, refreshToken }) {
  return new Promise((resolve, reject) => {
    api
      .get('/v1/me', configFromTokens({ accessToken, refreshToken }))
      .then((res) => resolve(res.data))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function getRecentlyPlayedTracks({ accessToken, refreshToken, limit = 50 }) {
  return new Promise((resolve, reject) => {
    api
      .get('/v1/me/player/recently-played', {
        params: { limit },
        ...configFromTokens({ accessToken, refreshToken }),
      })
      .then((response) => resolve(response.data))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function getUsersTopTracks({
  accessToken,
  refreshToken,
  timeRange = 'medium_term',
  limit = 50,
}) {
  return new Promise((resolve, reject) => {
    const params = { time_range: timeRange, limit };
    api
      .get('/v1/me/top/tracks', {
        params,
        ...configFromTokens({ accessToken, refreshToken }),
      })
      .then((response) => resolve(response.data))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function getUsersSavedTracks({ accessToken, refreshToken, limit = 50, offset }) {
  return new Promise((resolve, reject) => {
    const params = { limit, offset };
    api
      .get('/v1/me/tracks', {
        params,
        ...configFromTokens({ accessToken, refreshToken }),
      })
      .then((response) => resolve(response.data))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function getRecommendedTracks({ seed_artists, seed_tracks, limit = 100 }) {
  return new Promise((resolve, reject) => {
    const params = {
      seed_artists: seed_artists ? seed_artists.join(',') : undefined,
      seed_tracks: seed_tracks ? seed_tracks.join(',') : undefined,
      limit,
    };
    api
      .get('/v1/recommendations', { params })
      .then((response) => resolve(response.data))
      .catch((err) => reject(logAndReturnError(err)));
  });
}

function configFromTokens({ accessToken, refreshToken }) {
  return {
    headers: { Authorization: `Bearer ${accessToken}` },
    __refreshToken: refreshToken,
    json: true,
    retry: 20,
    retryDelay: 1000,
  };
}

module.exports = {
  getMe,
  getRecentlyPlayedTracks,
  getUsersTopTracks,
  getUsersSavedTracks,
  getRecommendedTracks,
};
