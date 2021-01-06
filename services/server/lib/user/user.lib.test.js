const { assert } = require('chai');
const lib = require('./user.lib');
const db = require('../../db');
const sinon = require('sinon');
const { clearDatabase } = require('../../testHelpers/testUtils');
const spotifyLib = require('../spotify/lib/spotify.lib');
const {
  api_get_me_200,
  api_token_swap_code_200,
} = require('../../testHelpers/spotify/mockResponses');
const { createPlayolaUserSeed, createUser } = require('../../testHelpers/helpers');
const encryption = require('../../lib/spotify/encryption');
const eventStream = require('../eventStream');
const { events } = require('../events');

describe('User library functions', function () {
  var playolaUserSeed, getPlayolaUserSeedStub, userCreatedPublishStub;
  const accessToken = 'asdfafsd';
  const refreshToken = encryption.encrypt(api_token_swap_code_200['refresh_token']);
  const spotifyUID = 'aSpotifyUID';
  const email = api_get_me_200['email'];

  before(async function () {
    await clearDatabase(db);
  });

  beforeEach(async function () {
    playolaUserSeed = createPlayolaUserSeed({ spotifyUID, email });
    await db.models.SpotifyUser.create({
      accessToken,
      refreshToken,
      spotifyUID,
      email,
    });
    userCreatedPublishStub = sinon.stub(eventStream.users, 'publish');
    getPlayolaUserSeedStub = sinon
      .stub(spotifyLib, 'getPlayolaUserSeed')
      .resolves(playolaUserSeed);
  });

  afterEach(async function () {
    await clearDatabase(db);
    getPlayolaUserSeedStub.restore();
    userCreatedPublishStub.restore();
  });

  describe('CREATE', function () {
    it('just gets a user if they already exist', async function () {
      let existingUser = await db.models.User.create(playolaUserSeed);
      let createdUser = await lib.createUserViaSpotifyRefreshToken({ refreshToken });
      assert.equal(createdUser.id, existingUser.id);
    });

    it('creates a user if they do not exist', async function () {
      let createdUser = await lib.createUserViaSpotifyRefreshToken({ refreshToken });
      assert.ok(createdUser);
      assert.equal(createdUser.email, playolaUserSeed.email);
      assert.equal(createdUser.profileImageURL, playolaUserSeed.profileImageURL);
      assert.equal(createdUser.spotifyUID, playolaUserSeed.spotifyUID);
    });

    it('broadcasts an event if the user was created', async function () {
      let createdUser = await lib.createUserViaSpotifyRefreshToken({ refreshToken });
      sinon.assert.calledOnce(userCreatedPublishStub);
      sinon.assert.calledWith(userCreatedPublishStub, events.USER_CREATED, {
        user: createdUser,
      });
    });

    it('does not broadcast an event if the user was just updated', async function () {
      await db.models.User.create(playolaUserSeed);
      await lib.createUserViaSpotifyRefreshToken({ refreshToken });
      sinon.assert.notCalled(userCreatedPublishStub);
    });
  });

  describe('GET', function () {
    it('GETS a user', async function () {
      let user = await createUser(db);
      let foundUser = await lib.getUser({ userId: user.id });
      assert.equal(foundUser.id, user.id);
    });
  });
});
