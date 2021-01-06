const Sequelize = require('sequelize');
const logger = require('../lib/logger');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: process.env.NODE_ENV === 'test' ? false : logger.log,
});
const User = require('./models/user.model');

User.hasMany(UserSong, { onDelete: 'CASCADE' });
Song.hasMany(UserSong, { onDelete: 'CASCADE' });
UserSong.belongsTo(User);
UserSong.belongsTo(Song);

const models = {
  User,
};

module.exports = {
  sequelize,
  db: sequelize,
  models,
};
