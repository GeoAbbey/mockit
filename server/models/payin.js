"use strict";
import { v4 } from "uuid";

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
      this.belongsTo(models.User, { foreignKey: "ownerId" });
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
        type: DataTypes.INTEGER,
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
