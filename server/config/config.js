const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.USERNAME,
    password: null,
    database: process.env.LOCAL_DATABASE,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
  },

  production: {
    use_env_variable: process.env.PROD_DATABASE,
  },
};
