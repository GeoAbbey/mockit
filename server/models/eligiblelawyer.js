"use strict";
import { v4 } from "uuid";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EligibleLawyer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Response, {
        as: "eligibleLawyers",
        foreignKey: "responseId",
        onDelete: "CASCADE",
      });

      this.belongsTo(models.User, {
        foreignKey: "lawyerId",
        onDelete: "CASCADE",
      });
    }
  }
  EligibleLawyer.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      responseId: { type: DataTypes.UUID, allowNull: false },
      lawyerId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "EligibleLawyer",
    }
  );
  return EligibleLawyer;
};
