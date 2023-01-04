"use strict";
import { v4 } from "uuid";
import { nanoid } from "nanoid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { as: "ownerProfile", foreignKey: "reporterId" });
      this.hasMany(models.Comment, { as: "comments", foreignKey: "reportId" });
      this.hasMany(models.Reaction, { as: "hasLiked", foreignKey: "modelId" });
      this.hasMany(models.Reaction, { as: "hasRePosted", foreignKey: "modelId" });
    }
  }
  Report.init(
    {
      content: { type: DataTypes.TEXT, allowNull: false },
      reporterId: { type: DataTypes.UUID, allowNull: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      location: { type: DataTypes.STRING },
      numOfRePosts: { type: DataTypes.INTEGER, defaultValue: 0 },
      numOfLikes: { type: DataTypes.INTEGER, defaultValue: 0 },
      numOfComments: { type: DataTypes.INTEGER, defaultValue: 0 },
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      attachments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
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
      modelName: "Report",
    }
  );
  return Report;
};
