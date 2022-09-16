"use strict";
import { v4 } from "uuid";

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
      this.belongsTo(models.User, { foreignKey: "ownerId", as: "lawyerProfile" });
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
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["in-progress", "completed"]],
        },
        defaultValue: "in-progress",
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      amountInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.amount;
        },
        set(value) {
          throw new Error(`Do not try to set the  pendingAmountInNaira ${value}!`);
        },
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      type: { allowNull: false, type: DataTypes.STRING },
      modelId: { allowNull: false, type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "Payout",
    }
  );
  return Payout;
};
