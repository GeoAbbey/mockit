"use strict";

import { v4 } from "uuid";

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
      this.belongsTo(models.User, { foreignKey: "ownerId", onDelete: "CASCADE" });
      this.belongsTo(models.User, {
        foreignKey: "assignedLawyerId",
        onDelete: "CASCADE",
      });
    }
  }
  Invitation.init(
    {
      reason: { type: DataTypes.STRING, allowNull: false },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      assignedLawyerId: { type: DataTypes.UUID },
      status: {
        type: DataTypes.ENUM,
        values: ["initiated", "in-progress", "completed"],
        defaultValue: "initiated",
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
