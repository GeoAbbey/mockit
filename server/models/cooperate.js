"use strict";

import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cooperate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "id" });
      this.hasMany(models.CooperateAccess, { foreignKey: "ownerId" });
    }
  }
  Cooperate.init(
    {
      companyName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      companyAddress: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      companyEmail: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      contactName: { type: DataTypes.STRING, allowNull: false },
      contactPhone: { type: DataTypes.STRING, allowNull: false },
      code: { type: DataTypes.STRING, allowNull: false, defaultValue: () => nanoid(15) },
      walletAmount: {
        type: DataTypes.INTEGER,
        defaultValue: () => 0,
      },
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, allowNull: false },
    },
    {
      sequelize,
      modelName: "Cooperate",
    }
  );
  return Cooperate;
};
