"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "ownerId", as: "ownerProfile" });
      this.belongsTo(models.User, { foreignKey: "performedBy", as: "performedProfile" });
    }
  }
  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      performedBy: { type: DataTypes.UUID },
      type: {
        type: DataTypes.STRING,
      },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(10),
      },
      modelId: {
        type: DataTypes.UUID,
      },
      code: {
        type: DataTypes.STRING,
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
