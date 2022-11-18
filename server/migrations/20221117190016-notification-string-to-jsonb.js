"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "Notifications",
      "content",
      {
        type: `JSONB USING CAST ("content" as JSONB)`,
      },
      { underscored: true }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Notifications", "content", {
      type: `TEXT USING CAST ("content" as TEXT)`,
    });
  },
};
