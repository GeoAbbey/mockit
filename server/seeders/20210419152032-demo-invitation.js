"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "Invitations",
      [
        {
          status: "initiated",
          id: "d3649ce6-b20f-449b-a467-15f46042489c",
          reason: "In the mercy of the king",
          venue: "now we believe",
          ownerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedLawyerId: null,
        },

        {
          status: "in-progress",
          id: "6f3581c5-cf7a-43d4-a975-b4ceb45daf2f",
          reason: "In the mercy of the king",
          venue: "now we believe",
          ownerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedLawyerId: "7642ae8b-d521-405c-bce2-c54da4a24a79",
        },
        {
          status: "completed",
          id: "3e684659-078e-4047-a737-b2c74713a7eb",
          reason: "In the mercy of the king",
          venue: "now we believe",
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
    await queryInterface.bulkDelete("Invitations", null, {});
  },
};
