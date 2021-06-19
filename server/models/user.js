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
      this.hasMany(models.Invitation, { as: "myInvitations", foreignKey: "ownerId" });
      this.hasMany(models.Invitation, { as: "invitationLawyer", foreignKey: "assignedLawyerId" });
      this.hasMany(models.Review, { as: "reviews", foreignKey: "reviewerId" });
      this.hasMany(models.SmallClaim, { as: "myClaims", foreignKey: "ownerId" });
      this.hasMany(models.SmallClaim, { as: "claimsLawyer", foreignKey: "assignedLawyerId" });
      this.hasMany(models.Report, { as: "ownerProfile", foreignKey: "reporterId" });
      this.hasMany(models.Comment, { as: "myProfile", foreignKey: "commenterId" });
      this.hasMany(models.Notification, { as: "profile", foreignKey: "ownerId" });
      this.hasMany(models.InterestedLawyer, { foreignKey: "lawyerId" });
      this.hasMany(models.Reaction, { as: "myLikes", foreignKey: "ownerId" });
      this.hasMany(models.Reaction, { as: "myRepost", foreignKey: "ownerId" });
      this.hasMany(models.Response, { as: "myEmergencyResponse", foreignKey: "ownerId" });
      this.hasMany(models.Response, {
        as: "assignedEmergencyResponse",
        foreignKey: "assignedLawyerId",
      });
      this.hasOne(models.LocationDetail, { foreignKey: "id" });
      this.hasOne(models.AccountInfo, { foreignKey: "id" });
      this.hasOne(models.Transaction, { foreignKey: "ownerId" });
      this.hasMany(models.EligibleLawyer, {
        as: "lawyerProfile",
        foreignKey: "lawyerId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.PayIn, { foreignKey: "ownerId" });
      this.hasMany(models.AuthCode, { foreignKey: "ownerId" });
      this.hasMany(models.Payout, { foreignKey: "lawyerId" });
      this.hasOne(models.Cooperate, { foreignKey: "id" });
      this.hasMany(models.CooperateAccess, { foreignKey: "ownerId" });
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
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      profilePic: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "https://zapplawyer.s3.us-west-2.amazonaws.com/attachments/user.png",
      },
      lawyer: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          isVerified: false,
          description: "",
          documents: {},
        },
      },
      firebaseToken: { type: DataTypes.STRING },
      hasAgreedToTerms: { type: DataTypes.BOOLEAN },
      role: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["user", "lawyer", "admin", "super-admin"]],
        },
        defaultValue: "user",
      },
      gender: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["male", "female"]],
        },
        allowNull: false,
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
