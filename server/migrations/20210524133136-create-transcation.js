"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ownerId: {
        type: Sequelize.UUID,
        onDelete: "NO ACTION",
        references: {
          model: "Users",
          key: "id",
          as: "ownerId",
        },
      },
      type: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.STRING,
      },
      notes: {
        type: Sequelize.STRING,
      },
      modelId: {
        type: Sequelize.UUID,
      },
      amount: {
        type: Sequelize.FLOAT,
      },
      ticketId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      performedBy: {
        type: Sequelize.UUID,
        onDelete: "NO ACTION",
        references: {
          model: "Users",
          key: "id",
          as: "performedBy",
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
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Transactions");
  },
};
