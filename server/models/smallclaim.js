"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";
import { someDefaults } from "../utils/processInput";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SmallClaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "ownerProfile",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.User, {
        foreignKey: "assignedLawyerId",
        as: "lawyerProfile",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Review, { as: "reviews", foreignKey: "modelId" });
      this.hasMany(models.InterestedLawyer, { as: "myInterest", foreignKey: "claimId" });
      this.hasMany(models.MileStone, { foreignKey: "claimId" });
    }
  }
  SmallClaim.init(
    {
      claim: { type: DataTypes.TEXT, allowNull: false },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      attachments: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      venue: { type: DataTypes.JSONB, allowNull: false },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      assignedLawyerId: { type: DataTypes.UUID },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(10),
      },
      isReassessed: { type: DataTypes.BOOLEAN, defaultValue: () => false },
      paid: { type: DataTypes.BOOLEAN, defaultValue: () => false },
      isNotified: { type: DataTypes.BOOLEAN, defaultValue: () => false },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [
            [
              "initiated",
              "consultation_in_progress",
              "consultation_completed",
              "completed",
              "cancelled",
              "lawyer_consent",
              "closed",
              "engagement",
            ],
          ],
        },
        defaultValue: "initiated",
      },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "SmallClaim",
    }
  );
  return SmallClaim;
};
