"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.sequelize.query("CREATE EXTENSION postgis;");
  },
  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * */

    return queryInterface.sequelize.query("DROP EXTENSION postgis CASCADE;");
  },
};
