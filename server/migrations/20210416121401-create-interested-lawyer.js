"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("InterestedLawyers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      baseCharge: {
        type: Sequelize.INTEGER,
      },
      serviceCharge: {
        type: Sequelize.INTEGER,
      },
      lawyerId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
          as: "lawyerId",
        },
      },
      meta: {
        type: Sequelize.JSONB,
      },
      modelId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "SmallClaims",
          key: "id",
          as: "modelId",
        },
      },
      modelType: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("InterestedLawyers");
  },
};
