"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Responses", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      status: {
        type: Sequelize.STRING,
      },
      meta: {
        type: Sequelize.JSONB,
      },
      isNotified: {
        type: Sequelize.BOOLEAN,
      },
      ticketId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
      assignedLawyerId: {
        type: Sequelize.UUID,
        onDelete: "NO ACTION",
        references: {
          model: "Users",
          key: "id",
          as: "assignedLawyerId",
        },
      },
      paid: {
        type: Sequelize.BOOLEAN,
      },
      meetTime: {
        type: Sequelize.DATE,
      },
      startingLocation: {
        type: Sequelize.GEOMETRY,
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
    await queryInterface.dropTable("Responses");
  },
};
