"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("EligibleLawyers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      responseId: {
        type: Sequelize.UUID,
        references: {
          model: "Responses",
          key: "id",
          as: "responseId",
        },
      },
      lawyerId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
          as: "lawyerId",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("EligibleLawyers");
  },
};
