"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PayIn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "ownerId", as: "ownerProfile" });
    }
  }
  PayIn.init(
    {
      for: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["singleSmallClaim", "singleInvitation", "wallet", "subscription", "cooperate"]],
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(10),
      },
      reference: { type: DataTypes.STRING, allowNull: false },
      subQuantity: {
        type: DataTypes.JSONB,
      },
      modelId: { type: DataTypes.UUID },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "PayIn",
    }
  );
  return PayIn;
};
