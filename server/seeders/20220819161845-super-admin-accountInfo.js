"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "AccountInfos",
      [
        {
          id: "a2e2c494-0be4-4b7f-92bb-aeaa3d6a431b",
          walletAmount: 0,
          pendingAmount: 0,
          subscriptionCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("AccountInfos", null, {});
  },
};
