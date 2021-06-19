"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AuthCode extends Model {
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
  AuthCode.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      authorizationCode: {
        type: DataTypes.STRING,
      },
      last4: {
        type: DataTypes.STRING,
      },
      cardDetails: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: "AuthCode",
    }
  );
  return AuthCode;
};
