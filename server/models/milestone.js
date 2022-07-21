"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MileStone extends Model {
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
  MileStone.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      lawyerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["initiated", "in-progress", "completed"]],
        },
        defaultValue: "initiated",
      },
      claimId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: () => false,
      },
      content: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      percentage: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "MileStone",
    }
  );
  return MileStone;
};
