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
          likedBy: JSON.stringify({}),
          amplifiedBy: JSON.stringify({
            "40fbc4cd-2b20-4b9b-9c14-73f274a465d7": true,
          }),
          id: "6171a987-9d2e-4596-9d17-6e293eaba2b6",
          attachments: ["in the Glory of the King", "It is what it is"],
          content: "In the power of the King",
          location: "india",
          reporterId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          likedBy: JSON.stringify({
            "dd1b66f7-f165-4eba-97e4-e07c97089303": true,
          }),
          amplifiedBy: JSON.stringify({
            "40fbc4cd-2b20-4b9b-9c14-73f274a465d7": true,
          }),
          id: "07c0a37a-d175-4928-af93-93e46b54646f",
          attachments: ["in the Glory of the King", "It is what it is"],
          content: "In the power of the King",
          location: "india",
          reporterId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          likedBy: JSON.stringify({
            "dd1b66f7-f165-4eba-97e4-e07c97089303": true,
          }),
          amplifiedBy: JSON.stringify({}),
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
