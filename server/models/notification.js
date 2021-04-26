"use strict";
import { v4 } from "uuid";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { as: "profile", foreignKey: "ownerId" });
    }
  }
  Notification.init(
    {
      for: { type: DataTypes.STRING, allowNull: false },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      content: { type: DataTypes.STRING, allowNull: false },
      seen: { type: DataTypes.BOOLEAN, defaultValue: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
