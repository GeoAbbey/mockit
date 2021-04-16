import da from "date-fns/esm/locale/da/index.js";
import debug from "debug";

const log = debug("app:modules:utils:send-notification-to-client");

import { messaging } from "../loaders/firebaseInit";

export const sendNotificationToClient = async ({ tokens, data }) => {
  data = { data: JSON.stringify(data) };

  try {
    const response = await messaging.sendMulticast({ tokens, data });
    const result = {
      successes: 0,
      failures: 0,
    };
    response.responses.forEach((res) => {
      res.success === true ? ++result.successes : ++result.failures;
    });

    log("Notification sent:", `${result.successes} successful, ${result.failures} failed`);
  } catch (error) {
    log(`Error sending message: ${error}`);
  }
};
