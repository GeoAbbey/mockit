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
      this.belongsTo(models.User, { foreignKey: "lawyerId" });
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
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lawyerId: { type: DataTypes.UUID, allowNull: false },
      payStackId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      data: { allowNull: false, type: DataTypes.JSONB },
    },
    {
      sequelize,
      modelName: "Payout",
    }
  );
  return Payout;
};
