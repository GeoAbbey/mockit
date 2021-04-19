"use strict";

const v4 = require("uuid").v4;
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
          id: "ec929b39-3536-4c6f-b838-5daa4525ef2c",
          role: "admin",
          firstName: "Benjamin",
          lastName: "Alamu",
          email: "ben@gmail.com",
          password: await bcrypt.hash("Password", 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "7642ae8b-d521-405c-bce2-c54da4a24a79",
          role: "lawyer",
          firstName: "Gbolahan",
          lastName: "Olagunju",
          password: await bcrypt.hash("Password", 10),
          email: "gbols@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3e684659-078e-4047-a737-b2c74713a7eb",
          role: "lawyer",
          firstName: "Dumto",
          lastName: "Zillion",
          password: await bcrypt.hash("Password", 10),
          email: "dumto@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          role: "user",
          firstName: "Abbey",
          password: await bcrypt.hash("Password", 10),
          lastName: "Devotee",
          email: "abbey@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3700e7f0-c47d-49c7-8101-2be41b10f330",
          role: "super-admin",
          firstName: "Folarin",
          lastName: "Ahmed",
          password: await bcrypt.hash("Password", 10),
          email: "folarin@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
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
