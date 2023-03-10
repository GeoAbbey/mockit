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
      this.belongsTo(models.SmallClaim, { foreignKey: "claimId" });
      this.belongsTo(models.User, { as: "profile", foreignKey: "lawyerId" });
    }
  }
  InterestedLawyer.init(
    {
      serviceCharge: { type: DataTypes.NUMBER, allowNull: false },
      serviceChargeInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.serviceCharge;
        },
        set(value) {
          throw new Error(`Do not try to set the serviceChargeInNaira ${value}!`);
        },
      },
      lawyerId: { type: DataTypes.UUID, allowNull: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      claimId: { type: DataTypes.UUID, allowNull: false },
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
