"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Response extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "ownerId",
        onDelete: "CASCADE",
        as: "ownerProfile",
      });
      this.belongsTo(models.User, {
        foreignKey: "assignedLawyerId",
        as: "lawyerProfile",
        onDelete: "CASCADE",
      });
    }
  }
  Response.init(
    {
      meetTime: { type: DataTypes.DATE },
      assignedLawyerId: { type: DataTypes.UUID },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["initiated", "in-progress", "completed"]],
        },
        defaultValue: "initiated",
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "Response",
    }
  );
  return Response;
};
