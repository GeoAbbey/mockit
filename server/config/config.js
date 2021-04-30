const dotenv = require("dotenv");
dotenv.config();

const common = {
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  dialect: process.env.DIALECT,
};

module.exports = {
  development: {
    username: process.env.USERNAME,
<<<<<<< HEAD
=======
    clientUri: "http://localhost:3000",
>>>>>>> temp
    password: process.env.PASSWORD,
    database: process.env.LOCAL_DATABASE,
    host: process.env.HOST,
    mongoConnect: process.env.MONGO_DB_CONNECTION_LOCAL,
    runNotificationService: false,
    ...common,
  },

  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    mongoConnect: process.env.MONGO_DB_CONNECTION_PROD,
    runNotificationService: true,
    ...common,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
      },
    },
  },
};
