"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Payouts", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ownerId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "ownerId",
        },
      },
      amount: { type: Sequelize.FLOAT },
      status: {
        type: Sequelize.STRING,
      },
      ticketId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      modelType: { allowNull: false, type: Sequelize.STRING },
      modelId: { allowNull: false, type: Sequelize.STRING },
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
    await queryInterface.dropTable("Payouts");
  },
};
