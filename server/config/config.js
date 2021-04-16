const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.LOCAL_DATABASE,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    mongoConnect: process.env.MONGO_DB_CONNECTION_LOCAL,
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },

  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    mongoConnect: process.env.MONGO_DB_CONNECTION_PROD,
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
      },
    },
  },
};
