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
    payment_base_url: process.env.MONNIFY_BASE_URL,
    payment_contract_code: process.env.MONNIFY_CONTRACT_CODE,
    payment_secret_key: process.env.MONNIFY_SECRET_KEY,
    payment_api_key: process.env.MONNIFY_API_KEY,
    payment_source_account_number: process.env.MONNIFY_WALLET_ACCOUNT_NUMBER,
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
    payment_base_url: process.env.MONNIFY_PROD_BASE_URL,
    payment_contract_code: process.env.MONNIFY_PROD_CONTRACT_CODE,
    payment_secret_key: process.env.MONNIFY_PROD_SECRET_KEY,
    payment_api_key: process.env.MONNIFY_PROD_API_KEY,
    payment_source_account_number: process.env.MONNIFY_PROD_WALLET_ACCOUNT_NUMBER,
    ...common,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
      },
    },
  },
};
