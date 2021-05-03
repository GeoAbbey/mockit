"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Report, { as: "reportComments", foreignKey: "commenterId" });
      this.belongsTo(models.User, { as: "myProfile", foreignKey: "commenterId" });
      this.hasMany(models.Reaction, { foreignKey: "modelId" });
    }
  }
  Comment.init(
    {
      content: { type: DataTypes.STRING },
      commenterId: { type: DataTypes.UUID, allowNull: false },
      reportId: { type: DataTypes.UUID, allowNull: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
