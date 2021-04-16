"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InterestedLawyer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.SmallClaim, { foreignKey: "modelId" });
      this.belongsTo(models.User, { as: "profile", foreignKey: "lawyerId" });
    }
  }
  InterestedLawyer.init(
    {
      baseCharge: { type: DataTypes.NUMBER, allowNull: false },
      serviceCharge: { type: DataTypes.NUMBER, allowNull: false },
      modelType: { type: DataTypes.STRING, allowNull: false },
      lawyerId: { type: DataTypes.UUID, allowNull: false },
      modelId: { type: DataTypes.UUID, allowNull: false },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "InterestedLawyer",
    }
  );
  return InterestedLawyer;
};
