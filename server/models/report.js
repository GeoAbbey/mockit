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
      this.belongsTo(models.User, { as: "reports", foreignKey: "reporterId" });
      this.hasMany(models.Comment, { as: "reportComments", foreignKey: "reportId" });
    }
  }
  Report.init(
    {
      content: { type: DataTypes.STRING, allowNull: false },
      reporterId: { type: DataTypes.UUID, allowNull: false },
      likedBy: { type: DataTypes.JSONB, defaultValue: {} },
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
