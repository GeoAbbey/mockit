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
      this.belongsTo(models.User, { foreignKey: "ownerId" });
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
          return this.amount / 100;
        },
        set(value) {
          throw new Error(`Do not try to set the  pendingAmountInNaira ${value}!`);
        },
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["otp", "success"]],
        },
      },
      approveBy: { type: DataTypes.UUID },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(10),
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      data: { allowNull: false, type: DataTypes.JSONB },
      transfer_code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "Withdrawal",
    }
  );
  return Withdrawal;
};
