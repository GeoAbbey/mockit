"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { as: "reviewerProfile", foreignKey: "reviewerId" });
      this.belongsTo(models.User, { as: "receiverProfile", foreignKey: "forId" });
      this.belongsTo(models.Invitation, { as: "invitation-reviews", foreignKey: "modelId" });
      this.belongsTo(models.SmallClaim, { as: "small-claims-reviews", foreignKey: "modelId" });
    }
  }
  Review.init(
    {
      modelType: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["SmallClaim", "Invitation", "Response"]],
        },
        allowNull: false,
      },
      modelId: { type: DataTypes.UUID, allowNull: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      reviewerId: { type: DataTypes.UUID, allowNull: false },
      forId: { type: DataTypes.UUID, allowNull: false },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(10),
      },
      rating: { type: DataTypes.INTEGER, allowNull: false, min: 1, max: 5 },
      feedback: DataTypes.TEXT,
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
