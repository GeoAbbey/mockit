import debug from "debug";
import axios from "axios";

const log = debug("app:modules:utils:send-notification-to-client");

import { messaging } from "../loaders/firebaseInit";

export const sendNotificationToClient = async ({ tokens, data }) => {
  // data = { data: JSON.stringify(data) };

  // try {
  //   const response = await messaging.sendMulticast({ tokens, data });
  //   const result = {
  //     successes: 0,
  //     failures: 0,
  //   };
  //   response.responses.forEach((res) => {
  //     res.success === true ? ++result.successes : ++result.failures;
  //   });

  //   log("Notification sent:", `${result.successes} successful, ${result.failures} failed`);
  // } catch (error) {
  //   log(`Error sending message: ${error}`);
  // }
  const headers = {
    Authorization:
      "key=AAAAljmo0vE:APA91bEbC9EXdBZbq--5lDzwtSzeuO1z-7wlGE60h0wBIb5EG2J9zt75KrfCab3fNShX3Bm9Whz-ZKbTnyOnNgvQK8331rK72ENMNFC4MMdfdB15S_pGhndhC5DbvbaeaHhUEuzCIe5S",
    "Content-Type": "application/json",
  };

  try {
    const response = await axios({
      method: "POST",
      url: "https://fcm.googleapis.com/fcm/send",
      headers,
      data: JSON.stringify(data),
    });

    console.log({ response });
  } catch (error) {
    log(`Error sending message: ${error}`);
  }
};
