"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "AccountInfos",
      [
        {
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
