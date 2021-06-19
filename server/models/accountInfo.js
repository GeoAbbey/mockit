"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AccountInfo extends Model {
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
  AccountInfo.init(
    {
      walletAmount: {
        type: DataTypes.INTEGER,
        defaultValue: () => 0,
      },
      subscriptionCount: {
        type: DataTypes.INTEGER,
        defaultValue: () => 0,
      },
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, allowNull: false },
    },
    {
      sequelize,
      modelName: "AccountInfo",
    }
  );
  return AccountInfo;
};
