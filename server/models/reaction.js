"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Comment, { as: "commentReaction", foreignKey: "modelId" });
      this.belongsTo(models.Report, { as: "reportReaction", foreignKey: "modelId" });
      this.belongsTo(models.User, { as: "myLikes", foreignKey: "ownerId" });
      this.belongsTo(models.User, { as: "myRepost", foreignKey: "ownerId" });
    }
  }
  Reaction.init(
    {
      modelType: { type: DataTypes.STRING, allowNull: false },
      modelId: { type: DataTypes.UUID, allowNull: false },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      reactionType: { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.BOOLEAN, allowNull: false },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "Reaction",
    }
  );
  return Reaction;
};
