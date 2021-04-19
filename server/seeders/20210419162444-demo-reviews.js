"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "Reviews",
      [
        {
          id: "1c2a1056-b110-4f8d-91a0-f7806b5117ea",
          rating: 1,
          feedback: "normal user that created review",
          reviewerId: "7642ae8b-d521-405c-bce2-c54da4a24a79",
          modelId: "7bf4ed58-5fbf-4082-8fa6-68a9bbb9122b",
          modelType: "SmallClaim",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "41032368-e677-4a06-8861-3136eababa56",
          rating: 5,
          feedback: "normal user that created review",
          reviewerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          modelId: "7bf4ed58-5fbf-4082-8fa6-68a9bbb9122b",
          modelType: "SmallClaim",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "b1931172-4c60-4bb0-951d-765b72567472",
          rating: 3,
          feedback: "normal user that created review",
          reviewerId: "49ed9b33-ba84-4d3a-bb90-b5d4c67fb44f",
          modelId: "3e684659-078e-4047-a737-b2c74713a7eb",
          modelType: "Invitation",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "665605c3-9731-4be2-9fbe-fd8c75addaee",
          rating: 2,
          feedback: "normal user that created review",
          reviewerId: "7642ae8b-d521-405c-bce2-c54da4a24a79",
          modelId: "3e684659-078e-4047-a737-b2c74713a7eb",
          modelType: "Invitation",
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
    await queryInterface.bulkDelete("Reviews", null, {});
  },
};
