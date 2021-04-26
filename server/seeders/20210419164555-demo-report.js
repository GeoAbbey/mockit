"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "Reports",
      [
        {
          id: "6171a987-9d2e-4596-9d17-6e293eaba2b6",
          attachments: ["in the Glory of the King", "It is what it is"],
          content: "In the power of the King",
          location: "india",
          reporterId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "07c0a37a-d175-4928-af93-93e46b54646f",
          attachments: ["in the Glory of the King", "It is what it is"],
          content: "In the power of the King",
          location: "india",
          reporterId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "60326b18-5729-43af-85e9-b35b63386ed2",
          attachments: ["in the Glory of the King", "It is what it is"],
          content: "In the power of the King",
          location: "india",
          reporterId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
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
     */
    await queryInterface.bulkDelete("Reports", null, {});
  },
};
