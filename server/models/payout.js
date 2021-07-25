"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "lawyerId", as: "lawyerProfile" });
    }
  }
  Payout.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lawyerId: { type: DataTypes.UUID, allowNull: false },
      payStackId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      modelType: { allowNull: false, type: DataTypes.STRING },
      modelId: { allowNull: false, type: DataTypes.STRING },
      data: { allowNull: false, type: DataTypes.JSONB },
    },
    {
      sequelize,
      modelName: "Payout",
    }
  );
  return Payout;
};
