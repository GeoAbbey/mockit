"use strict";
import { v4 } from "uuid";

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
      this.hasMany(models.Reaction, { as: "likes", foreignKey: "modelId" });
      this.hasMany(models.Reaction, { as: "reposts", foreignKey: "modelId" });
    }
  }
  Report.init(
    {
      content: { type: DataTypes.STRING, allowNull: false },
      reporterId: { type: DataTypes.UUID, allowNull: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      location: { type: DataTypes.STRING },
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
