"use strict";
import { v4 } from "uuid";
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
      ownerId: { type: DataTypes.UUID, allowNull: false },
      data: { allowNull: false, type: DataTypes.JSONB },
      payStackId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Withdrawal",
    }
  );
  return Withdrawal;
};
