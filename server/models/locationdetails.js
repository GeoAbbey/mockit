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
      this.belongsTo(models.User, { foreignKey: "id" });
    }
  }
  LocationDetail.init(
    {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, allowNull: false },
      socketId: { type: DataTypes.STRING },
      speed: { type: DataTypes.STRING },
      online: { type: DataTypes.BOOLEAN, defaultValue: false },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      location: { type: DataTypes.GEOMETRY("POINT") },
      assigneeId: { type: DataTypes.UUID },
    },
    {
      sequelize,
      modelName: "LocationDetail",
    }
  );
  return LocationDetail;
};
