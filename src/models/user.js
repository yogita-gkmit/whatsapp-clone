'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User.belongsToMany(models.Chat,
      //   { through: 'messages',
      //     foreignKey: 'chat_id',
      //   });
      // Parent.hasMany(Child, { foreignKey: 'Parent_parentId' });
      // Child.belongsTo(Parent, { foreignKey: 'Parent_parentId' });
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.literal('uuid_generate_v4()'),
        primaryKey: true,
        type: DataTypes.DataTypes.UUID,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
    },
  );
  return User;
};
