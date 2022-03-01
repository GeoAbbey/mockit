"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Reports", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      content: {
        type: Sequelize.TEXT,
      },
      attachments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      meta: {
        type: Sequelize.JSONB,
      },
      location: {
        type: Sequelize.STRING,
      },
      ticketId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      reporterId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "reporterId",
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
    await queryInterface.dropTable("Reports");
  },
};
