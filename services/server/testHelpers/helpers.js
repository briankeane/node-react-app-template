const { random } = require('faker');
const faker = require('faker');

const createUser = async function (db, data = {}) {
  return await db.models.User.create({
    displayName: data.displayName || faker.name.firstName(),
    email: data.email || faker.internet.email(),
    profileImageURL: data.profileImageURL || randomImageURL(),
    role: data.role || 'user',
  });
};

const createPlayolaUserSeed = function (data) {
  return {
    displayName: data.displayName || faker.name.firstName(),
    email: data.email || faker.internet.email(),
    profileImageURL: data.profileImageURL || randomImageURL(),
  };
};

const createPlayolaSongSeeds = function (count) {
  let seeds = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      title: faker.random.words(3),
      artist: faker.name.findName(),
      album: faker.random.words(3),
      durationMS: faker.random.number({ min: 10000, max: 240000 }),
      popularity: faker.random.number({ min: 0, max: 100 }),
      isrc: faker.random.uuid(),
      spotifyID: faker.random.uuid(),
      imageURL: randomImageURL(),
    });
  }
  return seeds;
};

const createSong = async function (db, data = {}) {
  return await db.models.Song.create({
    title: data.title || faker.random.words(3),
    artist: data.artist || faker.name.findName(),
    album: data.album || faker.random.words(3),
    durationMS: data.durationMS || faker.random.number({ min: 10000, max: 240000 }),
    popularity: data.popularity || faker.random.number({ min: 0, max: 100 }),
    youTubeID: data.youTubeID || faker.random.alpha(),
    endOfMessageMS:
      data.endOfMessageMS || faker.random.number({ min: 10000, max: 240000 }),
    endOfIntroMS: data.endOfIntroMS || faker.random.number({ min: 1000, max: 240000 }),
    beginningOfOutroMS:
      data.beginningOfOutroMS || faker.random.number({ min: 1000, max: 240000 }),
    audioIsVerified: data.audioIsVerified || true,
    audioURL: data.audioURL || faker.internet.url(),
    isrc: data.isrc || faker.random.uuid(),
    spotifyID: data.spotifyID || faker.random.uuid(),
    imageURL: data.imageURL || randomImageURL(),
  });
};

function randomImageURL() {
  return `${faker.image.image()}/${Math.round(Math.random() * 1000)}`;
}
module.exports = {
  createPlayolaUserSeed,
  createPlayolaSongSeeds,
  createUser,
  createSong,
};
