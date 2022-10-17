const dotenv = require("dotenv");
dotenv.config();

const common = {
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  dialect: process.env.DIALECT,
  radius: process.env.RADIUS,
  invitationCost: process.env.INVITATION_COST,
  costOfSubscriptionUnit: process.env.SUBSCRIPTION_UNIT_COST,
  lawyerPercentage: process.env.LAWYERS_PERCENTAGE,
  averageSpeed: process.env.AVERAGE_SPEED,
  lawyerPassword: process.env.LAWYER_PASSWORD,
  oneTimeFee: process.env.ONE_TIME_FEE,
  consultationFee: process.env.CONSULTATION_FEE,
  lawyerConsultationPercentage: process.env.LAWYER_CONSULTATION_PERCENTAGE,
  administrationPercentage: process.env.ADMINISTRATION_PERCENTAGE,
  smsApiKey: process.env.SMS_API_KEY,
  smsBaseUrl: process.env.SMS_BASE_URL,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
};

module.exports = {
  development: {
    username: process.env.USERNAME,
    clientUri: "http://localhost:3000",
    password: process.env.PASSWORD,
    database: process.env.LOCAL_DATABASE,
    host: process.env.HOST,
    mongoConnect: process.env.LOCAL_MONGO_DB_CONNECTION,
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

  devDeployment: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    clientUri: process.env.CLIENT_URI,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    mongoConnect: process.env.DEV_MONGO_DB_CONNECTION,
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

  staging: {
    username: process.env.STAGE_DB_USERNAME,
    password: process.env.STAGE_DB_PASSWORD,
    port: process.env.STAGE_DB_PORT,
    clientUri: process.env.CLIENT_URI,
    database: process.env.STAGE_DB_NAME,
    host: process.env.STAGE_DB_HOSTNAME,
    mongoConnect: process.env.STAGE_MONGO_DB_CONNECTION,
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
