"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
      },
      firebaseToken: {
        type: Sequelize.STRING,
      },
      profilePic: {
        type: Sequelize.STRING,
      },
      settings: {
        type: Sequelize.JSONB,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      emergencyContact: {
        type: Sequelize.JSONB,
      },
      lawyer: {
        type: Sequelize.JSONB,
      },
      gender: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.JSONB,
      },
      otp: {
        type: Sequelize.JSONB,
      },
      dob: {
        type: Sequelize.STRING,
      },
      description: {
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
      deletedAt: {
        type: Sequelize.DATE,
      },
      meta: {
        type: Sequelize.JSONB,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Users");
  },
};
