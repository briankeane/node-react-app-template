const { createSong, createUser } = require('./helpers');
const db = require('../db');
const fs = require('fs');

describe('create sample date', function () {
  it('generates sample data', async function () {
    await generateSampleData();
  });
});

async function generateSampleData() {
  // give the first 2 users 20 userSongs
  var users = [],
    songs = [],
    userSongs = [];

  // make 20 users
  for (let i = 0; i < 20; i++) {
    users.push(await createUser(db));
  }

  // make 30 songs
  for (let i = 0; i < 30; i++) {
    songs.push(await createSong(db));
  }

  // give the first 2 users 25 userSongs -- 10 primary and 15 secondary
  for (let user of [users[0], users[1]]) {
    for (let i = 0; i < 25; i++) {
      let status = i < 10 ? 'primary' : 'secondary';
      let offset = user == users[0] ? 0 : 5;
      userSongs.push(
        await db.models.UserSong.create(
          {
            userId: user.id,
            songId: songs[i + offset].id,
            status,
          },
          { include: db.models.Song }
        )
      );
    }
    userSongs = await db.models.UserSong.findAll({ include: db.models.Song });
  }

  // populate the song in the userSongs

  // userSongs = userSongs.map(
  //   async (userSong) =>
  //     await db.models.UserSong.findByPk(userSong.id, { include: db.models.Song })
  // );
  // await Promise.all(userSongs);

  return { users, songs, userSongs };
}

async function writeSampleData() {
  let sampleData = await generateSampleData();
  fs.writeFileSync('./testHelpers/sampleData.json', JSON.stringify(sampleData, 0, 2));
}

writeSampleData();
