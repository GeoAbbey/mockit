"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "Comments",
      [
        {
          id: "6b16285e-11b8-47f5-9577-56d9b5550a99",
          reportId: "6171a987-9d2e-4596-9d17-6e293eaba2b6",
          content: "I would like to say many other things",
          commenterId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
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
    await queryInterface.bulkDelete("Comments", null, {});
  },
};
