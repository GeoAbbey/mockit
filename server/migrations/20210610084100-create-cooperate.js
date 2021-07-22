"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Cooperates", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "id",
        },
      },
      companyName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      companyAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      companyEmail: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      walletAmount: {
        type: Sequelize.INTEGER,
      },
      contactName: { type: Sequelize.STRING, allowNull: false },
      contactPhone: { type: Sequelize.STRING, allowNull: false },
      code: { type: Sequelize.STRING, allowNull: false },
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
    await queryInterface.dropTable("Cooperates");
  },
};
