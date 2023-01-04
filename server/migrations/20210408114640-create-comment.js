"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Comments", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      meta: {
        type: Sequelize.JSONB,
      },
      content: {
        type: Sequelize.TEXT,
      },
      reportId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Reports",
          key: "id",
          as: "reportId",
        },
      },
      commenterId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "commenterId",
        },
      },
      numOfRePosts: {
        type: Sequelize.INTEGER,
      },
      numOfLikes: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Comments");
  },
};
