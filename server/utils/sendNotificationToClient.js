import debug from "debug";

const logger = debug("app:modules:utils:send-notification-to-client");

import { messaging } from "../loaders/firebaseInit";

export const sendNotificationToClient = async ({ tokens, data }) => {
  try {
    const result = await messaging.sendToDevice(tokens, data);
    logger(
      "Notification sent:",
      `${result.successCount} successful, ${result.failureCount} failed`
    );
  } catch (error) {
    logger(`Error sending message: ${error}`);
  }
};
