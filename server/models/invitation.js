"use strict";

import { v4 } from "uuid";
import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invitation extends Model {
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
      this.hasMany(models.Review, { as: "reviews", foreignKey: "modelId" });
    }
  }
  Invitation.init(
    {
      reason: { type: DataTypes.TEXT, allowNull: false },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      assignedLawyerId: { type: DataTypes.UUID, allowNull: true },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["initiated", "in-progress", "completed"]],
        },
        defaultValue: "initiated",
      },
      dateOfVisit: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      attachments: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      venue: { type: DataTypes.STRING, allowNull: false },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "Invitation",
    }
  );
  return Invitation;
};
