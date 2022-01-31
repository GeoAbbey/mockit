"use strict";
import { nanoid } from "nanoid";
import { v4 } from "uuid";

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
      this.belongsTo(models.User, { foreignKey: "id" });
    }
  }
  Recipient.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: v4,
      },
      lawyerId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(12),
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
