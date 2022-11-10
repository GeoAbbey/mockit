"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "Cooperates",
          "walletAmount",
          {
            type: Sequelize.FLOAT,
          },
          { transaction: t }
        ),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "Cooperates",
          "walletAmount",
          {
            type: Sequelize.INTEGER,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
