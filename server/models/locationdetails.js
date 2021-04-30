"use strict";
import { v4 } from "uuid";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LocationDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "ownerId" });
    }
  }
  LocationDetail.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
      },
      socketId: { type: DataTypes.STRING },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      online: { type: DataTypes.BOOLEAN, defaultValue: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      location: { type: DataTypes.GEOMETRY("POINT") },
      assigneeDetails: {
        type: DataTypes.JSONB,
        defaultValue: {
          socketId: "",
        },
      },
    },
    {
      sequelize,
      modelName: "LocationDetail",
    }
  );
  return LocationDetail;
};
