"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "ownerId", as: "lawyerProfile" });
      this.belongsTo(models.AccountInfo, { foreignKey: "id" });
    }
  }
  Withdrawal.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      amountInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.amount;
        },
        set(value) {
          throw new Error(`Do not try to set the  pendingAmountInNaira ${value}!`);
        },
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["PENDING_AUTHORIZATION", "SUCCESS", "FAILED", "INITIATED"]],
        },
      },
      approvedBy: { type: DataTypes.UUID },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      accountID: { type: DataTypes.STRING, allowNull: false },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(10),
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      data: { type: DataTypes.JSONB },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "Withdrawal",
    }
  );
  return Withdrawal;
};
