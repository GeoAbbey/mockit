"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Payouts", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      lawyerId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "lawyerId",
        },
      },
      ticketId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      modelType: { allowNull: false, type: Sequelize.STRING },
      modelId: { allowNull: false, type: Sequelize.STRING },
      payStackId: {
        allowNull: false,
        type: Sequelize.STRING,
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Payouts");
  },
};
