"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */

    return queryInterface.bulkInsert(
      "Users",
      [
        {
          profilePic: "https://zapplawyer.s3.us-west-2.amazonaws.com/attachments/user.png",
          password: await bcrypt.hash("Password", 10),
          lawyer: JSON.stringify({
            documents: {
              link: "",
            },
            isVerified: false,
            description: "",
          }),
          otp: JSON.stringify({
            value: "900754",
            expiresIn: new Date(),
          }),
          settings: JSON.stringify({
            isSuspended: false,
            hasAgreedToTerms: false,
            isEmailVerified: true,
            isPhone: {
              pinId: null,
              verified: true,
            },
            oneTimeSubscription: false,
            notification: {
              email: true,
              phone: true,
              inApp: true,
            },
          }),
          id: "a2e2c494-0be4-4b7f-92bb-aeaa3d6a431b",
          firstName: "Benjamin",
          lastName: "Alamu",
          email: "oluwaseunalamu@gmail.com",
          gender: "male",
          phone: "08162561265",
          role: "super-admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
          dob: null,
          emergencyContact: null,
          firebaseToken: null,
          deletedAt: null,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * */

    return queryInterface.bulkDelete("Users", null, {});
  },
};
