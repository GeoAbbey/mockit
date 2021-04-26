"use strict";
const { nanoid } = require("nanoid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */

    await queryInterface.bulkInsert(
      "SmallClaims",
      [
        {
          status: "initiated",
          id: "e3b69204-f322-4c9e-a866-8fb14df4d5d3",
          claim: "We are many more",
          venue: "Effc office jankara",
          amount: 50005,
          ticketId: nanoid(10),
          attachments: ["we are one for all", "in the  year King uzaahia died"],
          ownerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedLawyerId: null,
        },
        {
          status: "in-progress",
          id: "3930f5ad-4f59-4b25-878a-95bc0fbd7213",
          claim: "We are many more",
          venue: "Effc office jankara",
          amount: 50005,
          ticketId: nanoid(10),
          attachments: ["we are one for all", "in the  year King uzaahia died"],
          ownerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedLawyerId: "7642ae8b-d521-405c-bce2-c54da4a24a79",
        },
        {
          status: "completed",
          id: "7bf4ed58-5fbf-4082-8fa6-68a9bbb9122b",
          claim: "We are many more",
          venue: "Effc office jankara",
          amount: 50005,
          ticketId: nanoid(10),
          attachments: ["we are one for all", "in the  year King uzaahia died"],
          ownerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedLawyerId: "7642ae8b-d521-405c-bce2-c54da4a24a79",
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
     */
    await queryInterface.bulkDelete("SmallClaims", null, {});
  },
};
