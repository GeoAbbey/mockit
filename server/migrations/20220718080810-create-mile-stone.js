"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("MileStones", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      lawyerId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
          as: "lawyerId",
        },
      },
      claimId: {
        type: Sequelize.UUID,
        references: {
          model: "SmallClaims",
          key: "id",
          as: "claimId",
        },
      },
      title: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      paid: {
        type: Sequelize.BOOLEAN,
      },
      content: {
        type: Sequelize.TEXT,
      },
      percentage: {
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
    await queryInterface.dropTable("MileStones");
  },
};
