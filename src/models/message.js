'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Message.belongsToMany(models.User, { foreignKey: 'user_id' });
    }
  }
  Message.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.literal('uuid_generate_v4()'),
        primaryKey: true,
        type: DataTypes.DataTypes.UUID,
      },
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      chat_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
      },
      media: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      paranoid: true,
    },
  );
  return Message;
};
