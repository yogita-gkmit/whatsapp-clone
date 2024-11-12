'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Chat.belongsToMany(models.User, {
        through: 'messages',
        foreignKey: 'chat_id',
        other_key: 'user_id',
      });

      Chat.belongsToMany(models.User, {
        through: 'users_chats',
        foreignKey: 'chat_id',
        other_key: 'user_id',
      });
    }
  }
  Chat.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Chat',
    },
  );
  return Chat;
};
