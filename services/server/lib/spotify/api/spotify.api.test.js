const nock = require('nock');
const { assert } = require('chai');
const spotifyAPI = require('.');
const TokenExchange = require('../tokenExchange');
const encryption = require('../encryption');
const sinon = require('sinon');
const db = require('../../../db');
const settings = require('../../../settings');
const {
  api_get_me_200,
  api_get_me_recently_played_200,
  api_get_me_top_tracks_200,
  api_get_me_saved_tracks_200,
  api_get_recommendations_200,
  unauthorized_401_error_body,
} = require('../../../testHelpers/spotify/mockResponses');
const { checkAndClearNocks } = require('../../../testHelpers/testUtils');
const { createSpotifyUser } = require('../../../testHelpers/spotify/helpers');
const { suppressLogger, enableLogger } = require('../../logger');

describe('SpotifyAPI', function () {
  var accessToken, refreshToken, reqheaders, appOnlyReqHeaders;

  beforeEach(function () {
    accessToken = 'asfdasdfasdf';
    refreshToken = 'bbbbbbbbbbb';
    reqheaders = { Authorization: `Bearer ${accessToken}` };
    const basicToken = Buffer.from(
      `${settings.SPOTIFY_CLIENT_ID}:${settings.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');
    appOnlyReqHeaders = { Authorization: `Basic ${basicToken}` };
  });

  it('gets me... it really gets me', function (done) {
    nock('https://api.spotify.com', { reqheaders })
      .get('/v1/me')
      .reply(200, api_get_me_200);

    spotifyAPI
      .getMe({ accessToken, refreshToken })
      .then((me) => {
        assert.deepEqual(me, api_get_me_200);
        done();
      })
      .catch((err) => done(err));
  });

  it('gets recently played tracks', function (done) {
    nock('https://api.spotify.com', { reqheaders })
      .get('/v1/me/player/recently-played')
      .query({ limit: 50 })
      .reply(200, api_get_me_recently_played_200);

    spotifyAPI
      .getRecentlyPlayedTracks({ accessToken, refreshToken })
      .then((tracks) => {
        assert.deepEqual(tracks, api_get_me_recently_played_200);
        done();
      })
      .catch((err) => done(err));
  });

  it('gets the current users top tracks', function (done) {
    nock('https://api.spotify.com', { reqheaders })
      .get('/v1/me/top/tracks')
      .query({ limit: 50, time_range: 'medium_term' })
      .reply(200, api_get_me_top_tracks_200);

    spotifyAPI
      .getUsersTopTracks({ accessToken, refreshToken })
      .then((tracks) => {
        assert.deepEqual(tracks, api_get_me_top_tracks_200);
        done();
      })
      .catch((err) => done(err));
  });

  it('gets the current users saved tracks', function (done) {
    nock('https://api.spotify.com', { reqheaders })
      .get('/v1/me/tracks')
      .query({ limit: 50 })
      .reply(200, api_get_me_saved_tracks_200);

    spotifyAPI
      .getUsersSavedTracks({ accessToken, refreshToken })
      .then((tracks) => {
        assert.deepEqual(tracks, api_get_me_saved_tracks_200);
        done();
      })
      .catch((err) => done(err));
  });

  it('gets recommended songs from seed tracks', function (done) {
    const seed_tracks = ['trackID1', 'trackID2'];

    nock('https://api.spotify.com', { reqheaders: appOnlyReqHeaders })
      .get('/v1/recommendations')
      .query({ seed_tracks: seed_tracks.join(','), limit: 100 })
      .reply(200, api_get_recommendations_200);

    spotifyAPI
      .getRecommendedTracks({ seed_tracks })
      .then((response) => {
        assert.deepEqual(response, api_get_recommendations_200);
        done();
      })
      .catch((err) => done(err));
  });

  describe('Spotify API Interceptors', function () {
    let accessToken, accessToken2, accessToken3, refreshToken;

    describe('Automatic Token Refresh', function () {
      beforeEach(function () {
        accessToken = '123';
        accessToken2 = 'abc';
        accessToken3 = 'xyz';
        refreshToken = encryption.encrypt('myrefreshtoken');

        TokenExchange.refreshTokens = sinon.stub();
        TokenExchange.refreshTokens.onCall(0).resolves({ access_token: accessToken2 });
        TokenExchange.refreshTokens.onCall(1).resolves({ access_token: accessToken3 });

        nock('https://api.spotify.com', { Authorization: `Bearer ${accessToken}` })
          .get('/v1/me')
          .reply(401, unauthorized_401_error_body);

        nock('https://api.spotify.com', { Authorization: `Bearer ${accessToken2}` })
          .get('/v1/me')
          .reply(401, unauthorized_401_error_body);

        nock('https://api.spotify.com', { Authorization: `Bearer ${accessToken3}` })
          .get('/v1/me')
          .reply(200, api_get_me_200);
      });

      it('refreshes the accessToken if 403', function (done) {
        spotifyAPI
          .getMe({ accessToken, refreshToken })
          .then((me) => {
            assert.deepEqual(me, api_get_me_200);
            done();
          })
          .catch((err) => done(err));
      });

      it('refreshes the db model if new token retrieved', async function () {
        let spotifyUser = await createSpotifyUser(db, { accessToken, refreshToken });
        await spotifyAPI.getMe({ accessToken, refreshToken });
        await spotifyUser.reload();
        assert.equal(spotifyUser.accessToken, accessToken3);
      });
    });

    it('lets other errors through', function () {
      suppressLogger();
      nock('https://api.spotify.com', { Authorization: `Bearer ${accessToken}` })
        .get('/v1/me')
        .reply(500, { error: 'random' });

      return spotifyAPI
        .getMe({ accessToken, refreshToken })
        .then((me) => assert.fail('should not have succeeded'))
        .catch((err) => {
          assert.equal(err.response.status, 500);
          assert.equal(err.response.data.error, 'random');
        })
        .finally(enableLogger());
    });
  });

  afterEach(function () {
    checkAndClearNocks(nock);
  });
});
