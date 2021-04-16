import admin from "firebase-admin";

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

admin.initializeApp({
  credential: admin.credential.cert(config.googleApplicationCredentials),
});

export const messaging = admin.messaging();
