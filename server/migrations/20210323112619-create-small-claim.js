"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SmallClaims", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      claim: {
        type: Sequelize.TEXT,
      },
      amount: {
        type: Sequelize.INTEGER,
      },
      venue: {
        type: Sequelize.JSONB,
      },
      attachments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      status: {
        type: Sequelize.STRING,
      },
      ticketId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      meta: {
        type: Sequelize.JSONB,
      },
      paid: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("SmallClaims");
  },
};
