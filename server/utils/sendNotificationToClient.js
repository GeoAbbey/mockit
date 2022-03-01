import debug from "debug";

const logger = debug("app:modules:utils:send-notification-to-client");

const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];

import { messaging } from "../loaders/firebaseInit";

export const sendNotificationToClient = async ({ tokens, data }) => {
  logger(`running notification services: ${config.runNotificationService}`);

  if (config.runNotificationService) {
    try {
      const result = await messaging.sendToDevice(tokens, data);
      logger(
        "Notification sent:",
        `${result.successCount} successful, ${result.failureCount} failed`
      );
    } catch (error) {
      logger(`Error sending message: ${error}`);
    }
  }
};
