"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "InterestedLawyers",
      [
        {
          id: "c228ec65-30a1-4277-951e-74753960ef81",
          baseCharge: 2300,
          serviceCharge: 1200245,
          lawyerId: "3e684659-078e-4047-a737-b2c74713a7eb",
          modelType: "SmallClaim",
          modelId: "3930f5ad-4f59-4b25-878a-95bc0fbd7213",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "fdbecc13-1275-4dac-8f67-e249a1a5aa36",
          baseCharge: 2300,
          serviceCharge: 1200245,
          lawyerId: "7642ae8b-d521-405c-bce2-c54da4a24a79",
          modelType: "SmallClaim",
          modelId: "3930f5ad-4f59-4b25-878a-95bc0fbd7213",
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
    await queryInterface.bulkDelete("InterestedLawyers", null, {});
  },
};
