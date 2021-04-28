"use strict";
import { v4 } from "uuid";

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
      this.belongsTo(models.User, { as: "reviews", foreignKey: "reviewerId" });
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
      rating: { type: DataTypes.INTEGER, allowNull: false, min: 1, max: 5 },
      feedback: DataTypes.STRING,
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
