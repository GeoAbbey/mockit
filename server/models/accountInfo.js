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
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: () => 0,
      },
      pendingAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: () => 0,
      },
      walletAmountInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.walletAmount;
        },
        set(value) {
          throw new Error(`Do not try to set the walletAmountInNaira ${value}!`);
        },
      },
      pendingAmountInNaira: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.pendingAmount;
        },
        set(value) {
          throw new Error(`Do not try to set the  pendingAmountInNaira ${value}!`);
        },
      },
      bookAmount: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.walletAmount + this.pendingAmount;
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
