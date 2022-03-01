"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Reviews", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      feedback: {
        type: Sequelize.TEXT,
      },
      modelType: {
        type: Sequelize.STRING,
      },
      modelId: {
        type: Sequelize.UUID,
      },
      ticketId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      reviewerId: {
        type: Sequelize.UUID,
        onDelete: "NO ACTION",
        references: {
          model: "Users",
          key: "id",
          as: "reviewerId",
        },
      },
      forId: {
        type: Sequelize.UUID,
        onDelete: "NO ACTION",
        references: {
          model: "Users",
          key: "id",
          as: "forId",
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
    await queryInterface.dropTable("Reviews");
  },
};
