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
      this.hasMany(models.InterestedLawyer, { as: "interest", foreignKey: "lawyerId" });
      this.hasMany(models.MileStone, { foreignKey: "lawyerId" });
      this.hasMany(models.Reaction, { as: "myLikes", foreignKey: "ownerId" });
      this.hasMany(models.Reaction, { as: "myRepost", foreignKey: "ownerId" });
      this.hasMany(models.Response, { as: "myEmergencyResponse", foreignKey: "ownerId" });
      this.hasMany(models.Response, {
        as: "assignedEmergencyResponse",
        foreignKey: "assignedLawyerId",
      });
      this.hasOne(models.LocationDetail, { foreignKey: "id" });
      this.hasMany(models.Recipient, { foreignKey: "id" });
      this.hasOne(models.AccountInfo, { foreignKey: "id" });
      this.hasMany(models.Transaction, { foreignKey: "ownerId", as: "paymentFromWallet" });
      this.hasMany(models.EligibleLawyer, {
        as: "lawyerProfile",
        foreignKey: "lawyerId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.PayIn, { foreignKey: "ownerId", as: "oneTimePayments" });
      this.hasMany(models.AuthCode, { foreignKey: "ownerId" });
      this.hasMany(models.Payout, { foreignKey: "ownerId" });
      this.hasOne(models.Cooperate, { foreignKey: "id" });
      this.hasMany(models.CooperateAccess, {
        foreignKey: "ownerId",
        onDelete: "CASCADE",
        as: "accessOwnerProfile",
      });
      this.hasMany(models.CooperateAccess, {
        foreignKey: "userAccessId",
        as: "userWithAccessProfile",
        onDelete: "CASCADE",
      });
    }
  }

  User.init(
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      sumOfReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
      numOfReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, isEmail: true },
      password: { type: DataTypes.STRING, allowNull: false, min: 8 },
      phone: { type: DataTypes.STRING, allowNull: false, unique: true },
      profilePic: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "https://zapplawyer.s3.us-west-2.amazonaws.com/attachments/user.png",
      },
      settings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isSuspended: false,
          hasAgreedToTerms: false,
          isEmailVerified: false,
          isPhone: {
            pinId: null,
            verified: false,
          },
          notification: {
            email: true,
            phone: true,
            inApp: true,
          },
        },
      },
      address: {
        type: DataTypes.JSONB,
        defaultValue: {
          country: null,
          state: null,
          residence: {
            work: null,
            home: null,
          },
        },
      },
      dob: { type: DataTypes.STRING, isDate: true },
      emergencyContact: {
        type: DataTypes.JSONB,
        defaultValue: {
          profilePic: null,
          phone: null,
          firstName: null,
          lastName: null,
          email: null,
        },
      },
      description: { type: DataTypes.STRING },
      meta: { type: DataTypes.JSONB, defaultValue: {} },
      lawyer: {
        type: DataTypes.JSONB,
        defaultValue: {
          supremeCourtNumber: null,
          typeOfDocument: null,
          oneTimeSubscription: false,
          isVerified: "initiated",
          documents: {
            name: null,
            link: null,
          },
        },
      },
      firebaseToken: { type: DataTypes.STRING },
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
