"use strict";
import { v4 } from "uuid";
import { otp } from "../utils";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Invitation, { as: "owner", foreignKey: "ownerId" });
      this.hasMany(models.Invitation, { as: "assignedLawyer", foreignKey: "assignedLawyerId" });
      // models.user.hasMany(models.Invitation, {as:"userOne", as:"userTwo"})
    }
  }

  User.init(
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      notification: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      isAccountSuspended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, isEmail: true },
      password: { type: DataTypes.STRING, allowNull: false, min: 8 },
      isSubscribed: { type: DataTypes.BOOLEAN },
      isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      address: { type: DataTypes.JSONB },
      phone: { type: DataTypes.STRING },
      dob: { type: DataTypes.STRING, isDate: true },
      guarantors: { type: DataTypes.JSONB },
      profilePic: { type: DataTypes.STRING },
      creditCard: { type: DataTypes.STRING, isCreditCard: true },
      lawyer: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          isVerified: false,
          documents: {},
        },
      },
      hasAgreedToTerms: { type: DataTypes.BOOLEAN },
      role: {
        type: DataTypes.ENUM,
        values: ["user", "lawyer", "admin", "super-admin"],
        defaultValue: "user",
      },
      otp: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: () => otp(),
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
      paranoid: true,
      modelName: "User",
    }
  );
  return User;
};
