"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Withdrawals", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      amount: {
        type: Sequelize.INTEGER,
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
      approvedBy: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
          as: "approveBy",
        },
      },
      status: {
        type: Sequelize.STRING,
      },
      reference: {
        type: Sequelize.STRING,
      },
      accountID: {
        type: Sequelize.UUID,
        references: {
          model: "Recipients",
          key: "id",
          as: "accountID",
        },
      },
      ticketId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      data: { allowNull: false, type: Sequelize.JSONB },
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
    await queryInterface.dropTable("Withdrawals");
  },
};
