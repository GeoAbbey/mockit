"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Invitations", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      reason: {
        type: Sequelize.TEXT,
      },
      venue: {
        type: Sequelize.JSONB,
      },
      dateOfVisit: {
        type: Sequelize.DATE,
      },
      attachments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      paid: {
        type: Sequelize.BOOLEAN,
      },
      status: {
        type: Sequelize.STRING,
      },
      ticketId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
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
        allowNull: true,
        onDelete: "NO ACTION",
        references: {
          model: "Users",
          key: "id",
          as: " assignedLawyerId",
        },
      },
      meta: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable("Invitations");
  },
};
