import debug from "debug";

import { sendMail } from "../../utils";

const logger = debug("app:handlers:listeners:user-events");

export const userEvents = (eventEmitter) => {
  eventEmitter.on("user_signup", ({ user }) => {
    logger("user_signup events has been received");
    // sendMail(user);
  });
};
