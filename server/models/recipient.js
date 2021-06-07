"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recipient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Recipient.init(
    {
      code: { type: DataTypes.STRING, allowNull: false },
      payStackId: { type: DataTypes.STRING, allowNull: false },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      details: { type: DataTypes.JSONB, allowNull: false },
    },
    {
      sequelize,
      modelName: "Recipient",
    }
  );
  return Recipient;
};
