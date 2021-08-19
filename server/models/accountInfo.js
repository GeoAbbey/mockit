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
      pendingAmount: {
        type: DataTypes.INTEGER,
        defaultValue: () => 0,
      },
      walletAmountInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.walletAmount / 100;
        },
        set(value) {
          throw new Error(`Do not try to set the walletAmountInNaira ${value}!`);
        },
      },
      pendingAmountInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.pendingAmount / 100;
        },
        set(value) {
          throw new Error(`Do not try to set the  pendingAmountInNaira ${value}!`);
        },
      },
      bookAmount: {
        type: DataTypes.VIRTUAL,
        get() {
          return (this.walletAmount + this.pendingAmount) / 100;
        },
        set(value) {
          throw new Error(`Do not try to set the bookAmount ${value}!`);
        },
      },
      subscriptionCount: {
        type: DataTypes.INTEGER,
        defaultValue: () => 0,
      },
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    },
    {
      sequelize,
      modelName: "AccountInfo",
    }
  );
  return AccountInfo;
};
