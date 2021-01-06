const { Sequelize, DataTypes, Model } = require('sequelize');
const logger = require('../../lib/logger');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: process.env.NODE_ENV === 'test' ? false : logger.log,
});

class User extends Model {
  jwtRepr() {
    return {
      id: this.id.toString(),
      displayName: this.displayName,
      email: this.email,
      profileImageURL: this.profileImageURL,
      role: this.role,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false,
    },
    displayName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    profileImageURL: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'user', 'guest'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    modelName: 'user',
  }
);

User.associate = function (models) {
  // associations can be defined here
};

module.exports = User;
