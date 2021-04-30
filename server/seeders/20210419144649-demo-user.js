"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    // await queryInterface.sequelize.query("CREATE EXTENSION postgis;");
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          id: "ec929b39-3536-4c6f-b838-5daa4525ef2c",
          role: "admin",
          firstName: "Benjamin",
          gender: "male",
          isSubscribed: true,
          isVerified: false,
          lawyer: JSON.stringify({
            documents: {},
            isVerified: false,
          }),
          lastName: "Alamu",
          email: "ben@gmail.com",
          password: await bcrypt.hash("Password", 10),
          createdAt: new Date(),
          updatedAt: new Date(),
          otp: JSON.stringify({
            value: "486163",
            expiresIn: "2021-04-28T11:08:47.865Z",
          }),
        },
        {
          id: "7642ae8b-d521-405c-bce2-c54da4a24a79",
          role: "lawyer",
          firstName: "Gbolahan",
          isSubscribed: true,
          gender: "male",
          lawyer: JSON.stringify({
            documents: {},
            isVerified: false,
          }),
          isVerified: false,
          lastName: "Olagunju",
          password: await bcrypt.hash("Password", 10),
          email: "gbols@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          otp: JSON.stringify({
            value: "486162",
            expiresIn: "2021-04-28T11:08:47.865Z",
          }),
        },
        {
          id: "3e684659-078e-4047-a737-b2c74713a7eb",
          role: "lawyer",
          isSubscribed: true,
          gender: "male",
          firstName: "Dumto",
          lawyer: JSON.stringify({
            documents: {},
            isVerified: false,
          }),
          isVerified: false,
          lastName: "Zillion",
          password: await bcrypt.hash("Password", 10),
          email: "dumto@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          gender: "male",
          otp: JSON.stringify({
            value: "486163",
            expiresIn: "2021-04-28T11:08:47.865Z",
          }),
        },
        {
          id: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          role: "user",
          firstName: "Abbey",
          gender: "male",
          isSubscribed: true,
          lawyer: JSON.stringify({
            documents: {},
            isVerified: false,
          }),
          isVerified: false,
          password: await bcrypt.hash("Password", 10),
          lastName: "Devotee",
          gender: "male",
          email: "abbey@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          otp: JSON.stringify({
            value: "486663",
            expiresIn: "2021-04-28T11:08:47.865Z",
          }),
        },
        {
          id: "3700e7f0-c47d-49c7-8101-2be41b10f330",
          role: "super-admin",
          gender: "male",
          isSubscribed: true,
          lawyer: JSON.stringify({
            documents: {},
            isVerified: false,
          }),
          isVerified: false,
          firstName: "Folarin",
          lastName: "Ahmed",
          password: await bcrypt.hash("Password", 10),
          email: "folarin@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          otp: JSON.stringify({
            value: "482263",
            expiresIn: "2021-04-28T11:08:47.865Z",
          }),
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
