'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserChat.init(
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
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'UserChat',
    },
  );
  return UserChat;
};
