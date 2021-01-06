const { assert } = require('chai');
const sinon = require('sinon');
const db = require('../../db');
const { clearDatabase } = require('../../testHelpers/testUtils');
const lib = require('./station.lib');
const eventStream = require('../eventStream');
const { events } = require('../events');
const { models } = require('../../db');
const spotifyLib = require('../spotify/lib/spotify.lib');
const { createPlayolaSongSeeds, createUser } = require('../../testHelpers/helpers');

function defaultProps() {
  return {
    title: 'Too Much Love',
    artist: 'Rachel Loy',
    album: 'Not Yet',
    durationMS: 180000,
    popularity: 100,
    youTubeID: 'thisfersnet',
    endOfMessageMS: 160000,
    beginningOfOutroMS: 150000,
    endOfIntroMS: 3000,
    audioURL: 'https://songs.playola.fm/tooMuchLove.m4a',
    isrc: 'thisisanisrc',
    spotifyID: 'thisIsTheSpotifyID',
    imageURL: 'https://pics.albums.images.com/a-pic.jpg',
  };
}

async function createSong(attrs = {}) {
  return await db.models.Song.create({
    ...defaultProps(),
    ...attrs,
  });
}

describe('Song Lib Functions', function () {
  var songsPublishStub, stationsPublishStub;

  before(async function () {
    await clearDatabase(db);
  });

  beforeEach(function () {
    songsPublishStub = sinon.stub(eventStream.songs, 'publish');
    stationsPublishStub = sinon.stub(eventStream.stations, 'publish');
  });

  afterEach(async function () {
    songsPublishStub.restore();
    stationsPublishStub.restore();
    await clearDatabase(db);
  });

  describe('createSong', function () {
    it('creates a song', async function () {
      let createdSong = await createSong();
      const expectedProps = defaultProps();
      assert.equal(createdSong.title, expectedProps.title);
      assert.equal(createdSong.artist, expectedProps.artist);
      assert.equal(createdSong.album, expectedProps.album);
      assert.equal(createdSong.durationMS, expectedProps.durationMS);
      assert.equal(createdSong.popularity, expectedProps.popularity);
      assert.equal(createdSong.endOfMessageMS, expectedProps.endOfMessageMS);
      assert.equal(createdSong.beginningOfOutroMS, expectedProps.beginningOfOutroMS);
      assert.equal(createdSong.endOfIntroMS, expectedProps.endOfIntroMS);
      assert.equal(createdSong.audioURL, expectedProps.audioURL);
      assert.equal(createdSong.isrc, expectedProps.isrc);
      assert.equal(createdSong.spotifyID, expectedProps.spotifyID);
      assert.equal(createdSong.imageURL, expectedProps.imageURL);
    });

    it('only updates if a matching isrc exists', async function () {
      let expectedProps = defaultProps();
      let existingSong = await createSong({
        title: 'dummy',
        artist: 'dummy',
        album: 'dummy',
        durationMS: 1,
        popularity: 90,
        youTubeID: 'dummy',
        endOfMessageMS: 1,
        beginningOfOutroMS: 1,
        endOfIntroMS: 1,
        audioURL: 'dummy',
        isrc: expectedProps.isrc,
        spotifyID: 'dummy',
        imageURL: 'dummy',
      });
      let createdSong = await lib.createSong(expectedProps);
      assert.equal(createdSong.title, expectedProps.title);
      assert.equal(createdSong.artist, expectedProps.artist);
      assert.equal(createdSong.album, expectedProps.album);
      assert.equal(createdSong.durationMS, expectedProps.durationMS);
      assert.equal(createdSong.popularity, expectedProps.popularity);
      assert.equal(createdSong.endOfMessageMS, expectedProps.endOfMessageMS);
      assert.equal(createdSong.beginningOfOutroMS, expectedProps.beginningOfOutroMS);
      assert.equal(createdSong.endOfIntroMS, expectedProps.endOfIntroMS);
      assert.equal(createdSong.audioURL, expectedProps.audioURL);
      assert.equal(createdSong.isrc, expectedProps.isrc);
      assert.equal(createdSong.spotifyID, expectedProps.spotifyID);
      assert.equal(createdSong.imageURL, expectedProps.imageURL);
      assert.equal(createdSong.id, existingSong.id);
    });

    it('only updates if a matching spotifyID exists', async function () {
      let expectedProps = defaultProps();
      let existingSong = await createSong({
        title: 'dummy',
        artist: 'dummy',
        album: 'dummy',
        durationMS: 1,
        popularity: 80,
        youTubeID: 'dummy',
        endOfMessageMS: 1,
        beginningOfOutroMS: 1,
        endOfIntroMS: 1,
        audioURL: 'dummy',
        isrc: 'dummy',
        spotifyID: expectedProps.spotifyID,
      });

      let createdSong = await lib.createSong(expectedProps);
      assert.equal(createdSong.title, expectedProps.title);
      assert.equal(createdSong.artist, expectedProps.artist);
      assert.equal(createdSong.album, expectedProps.album);
      assert.equal(createdSong.durationMS, expectedProps.durationMS);
      assert.equal(createdSong.popularity, expectedProps.popularity);
      assert.equal(createdSong.endOfMessageMS, expectedProps.endOfMessageMS);
      assert.equal(createdSong.beginningOfOutroMS, expectedProps.beginningOfOutroMS);
      assert.equal(createdSong.endOfIntroMS, expectedProps.endOfIntroMS);
      assert.equal(createdSong.audioURL, expectedProps.audioURL);
      assert.equal(createdSong.isrc, expectedProps.isrc);
      assert.equal(createdSong.spotifyID, expectedProps.spotifyID);
      assert.equal(createdSong.id, existingSong.id);
    });

    it('does not trigger the SONG_CREATED event if the song was only updated', async function () {
      let expectedProps = defaultProps();
      await createSong({
        title: 'dummy',
        artist: 'dummy',
        album: 'dummy',
        durationMS: 1,
        youTubeID: 'dummy',
        endOfMessageMS: 1,
        beginningOfOutroMS: 1,
        endOfIntroMS: 1,
        audioURL: 'dummy',
        isrc: 'dummy',
        spotifyID: expectedProps.spotifyID,
      });
      await lib.createSong(expectedProps);
      sinon.assert.notCalled(songsPublishStub);
    });

    it('triggers a SONG_CREATED event if the song was created', async function () {
      await lib.createSong(defaultProps());
      sinon.assert.calledOnce(songsPublishStub);
      sinon.assert.calledWith(songsPublishStub, events.SONG_CREATED);
    });

    describe('Requires Song Consolidation', function () {
      let expectedProps, song1, song2;

      beforeEach(async function () {
        expectedProps = defaultProps();
        song1 = await createSong({
          title: 'dummy',
          artist: 'dummy',
          album: 'dummy',
          durationMS: 1,
          youTubeID: 'dummy',
          endOfMessageMS: 1,
          beginningOfOutroMS: 1,
          endOfIntroMS: 1,
          audioURL: 'dummy',
          isrc: undefined,
          spotifyID: expectedProps.spotifyID,
        });
        song2 = await createSong({
          title: 'dummy2',
          artist: 'dummy2',
          album: 'dummy2',
          durationMS: 2,
          youTubeID: 'dummy2',
          endOfMessageMS: 2,
          beginningOfOutroMS: 2,
          endOfIntroMS: 2,
          audioURL: 'dummy2',
          isrc: expectedProps.isrc,
          spotifyID: undefined,
        });
      });

      it('consolidates if spotifyID and isrc exist', async function () {
        let createdSong = await lib.createSong(expectedProps);
        assert.equal(createdSong.title, expectedProps.title);
        assert.equal(createdSong.artist, expectedProps.artist);
        assert.equal(createdSong.album, expectedProps.album);
        assert.equal(createdSong.durationMS, expectedProps.durationMS);
        assert.equal(createdSong.popularity, expectedProps.popularity);
        assert.equal(createdSong.endOfMessageMS, expectedProps.endOfMessageMS);
        assert.equal(createdSong.beginningOfOutroMS, expectedProps.beginningOfOutroMS);
        assert.equal(createdSong.endOfIntroMS, expectedProps.endOfIntroMS);
        assert.equal(createdSong.audioURL, expectedProps.audioURL);
        assert.equal(createdSong.isrc, expectedProps.isrc);
        assert.equal(createdSong.spotifyID, expectedProps.spotifyID);
        const oldID = createdSong.id == song1.id ? song2.id : song1.id;
        let shouldBeEmpty = await models.Song.findAll({ where: { id: oldID } });
        assert.equal(shouldBeEmpty.length, 0);
      });

      it('triggers a SONG_CONSOLIDATED event if songs were consolidated', async function () {
        let createdSong = await lib.createSong(expectedProps);
        const oldID = createdSong.id == song1.id ? song2.id : song1.id;
        sinon.assert.calledOnce(songsPublishStub);
        sinon.assert.calledWith(songsPublishStub, events.SONG_CONSOLIDATED, {
          deletedIDs: [oldID],
          updatedSong: createdSong,
        });
      });
    });
  });

  describe('Edit Song', function () {
    it('Updates a song', async function () {
      let song = await createSong();
      let expectedProps = defaultProps();
      let updatedSong = await lib.updateSong(song.id, expectedProps);
      assert.equal(updatedSong.title, expectedProps.title);
      assert.equal(updatedSong.artist, expectedProps.artist);
      assert.equal(updatedSong.album, expectedProps.album);
      assert.equal(updatedSong.durationMS, expectedProps.durationMS);
      assert.equal(updatedSong.popularity, expectedProps.popularity);
      assert.equal(updatedSong.endOfMessageMS, expectedProps.endOfMessageMS);
      assert.equal(updatedSong.beginningOfOutroMS, expectedProps.beginningOfOutroMS);
      assert.equal(updatedSong.endOfIntroMS, expectedProps.endOfIntroMS);
      assert.equal(updatedSong.audioURL, expectedProps.audioURL);
      assert.equal(updatedSong.isrc, expectedProps.isrc);
      assert.equal(updatedSong.spotifyID, expectedProps.spotifyID);
    });
  });

  describe('initializeSongsForUser', function () {
    let spotifyLibStub, songSeeds, user;

    beforeEach(async function () {
      songSeeds = createPlayolaSongSeeds(10);

      // create a song to be found instead of created
      await createSong(songSeeds[0]);
      user = await createUser(db, { email: 'bob@bob.com' });

      spotifyLibStub = sinon
        .stub(spotifyLib, 'getUserRelatedSongSeeds')
        .resolves(songSeeds);
    });

    afterEach(function () {
      spotifyLibStub.restore();
    });

    it('initializes songs for a user', async function () {
      let { userSongs } = await lib.initializeSongsForUser({ user });
      let songs = userSongs.map((userSong) => userSong.song);
      let allSongs = await db.models.Song.findAll({});
      assert.equal(allSongs.length, 10);
      assert.equal(songs.length, 10);
      songSeeds.forEach((seed) => {
        assert.isTrue(songs.map((song) => song.title).includes(seed.title));
      });
    });

    it('triggers a STATION_SONGS_INITIALIZED event', async function () {
      await lib.initializeSongsForUser({ user });
      sinon.assert.calledOnce(stationsPublishStub);
      sinon.assert.calledWith(stationsPublishStub, events.STATION_SONGS_INITIALIZED, {
        user,
      });
    });
  });
});
