"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Cooperates", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
      allowedEmails: {
        type: Sequelize.ARRAY(Sequelize.STRING),
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
