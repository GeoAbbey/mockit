const dotenv = require("dotenv");
dotenv.config();

const common = {
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  dialect: process.env.DIALECT,
  radius: process.env.RADIUS,
  invitationCost: process.env.INVITATION_COST,
  costOfSubscriptionUnit: process.env.SUBSCRIPTION_UNIT_COST,
  payStackSecretKey: process.env.PAYSTACK_SECRET,
  payStackPublicKey: process.env.PAYSTACK_PUBLIC,
  lawyerPercentage: process.env.LAWYERS_PERCENTAGE,
  averageSpeed: process.env.AVERAGE_SPEED,
  lawyerPassword: process.env.LAWYER_PASSWORD,
};

module.exports = {
  development: {
    username: process.env.USERNAME,
    clientUri: "http://localhost:3000",
    password: process.env.PASSWORD,
    database: process.env.LOCAL_DATABASE,
    host: process.env.HOST,
    mongoConnect: process.env.MONGO_DB_CONNECTION_LOCAL,
    runNotificationService: true,
    runEmailNotificationService: true,
    payoutInterval: process.env.PAYOUT_INTERVAL,
    ...common,
  },

  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    clientUri: process.env.CLIENT_URI,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    mongoConnect: process.env.MONGO_DB_CONNECTION_PROD,
    payoutInterval: process.env.PAYOUT_INTERVAL,
    runEmailNotificationService: true,
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
