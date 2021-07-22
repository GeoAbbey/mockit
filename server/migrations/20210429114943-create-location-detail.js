"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("LocationDetails", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "id",
        },
      },
      socketId: {
        type: Sequelize.STRING,
      },
      online: {
        type: Sequelize.BOOLEAN,
      },
      meta: {
        type: Sequelize.JSONB,
      },
      location: {
        type: Sequelize.GEOMETRY,
      },
      speed: {
        type: Sequelize.STRING,
      },
      assigningId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
          as: "assigningId",
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
    await queryInterface.dropTable("LocationDetails");
  },
};
