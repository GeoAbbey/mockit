import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../constants";
import { sendNotificationToUserOrLawyer } from "./helpers";

const logger = debug("app:handlers:listeners:cooperate-access-events");

export const cooperateAccessEvents = (eventEmitter) => {
  eventEmitter.on(
    `${EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED}`,
    async ({ data, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED} events has been received`);

      console.log({ data, decodedToken }, "🎗🐥");

      sendNotificationToUserOrLawyer(
        EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED,
        data,
        decodedToken,
        "COOPERATE_ACCESS",
        "GRANTED",
        "userAccessId"
      );
    }
  );

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED}`,
    async ({ data, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED} events has been received`);

      console.log({ data, decodedToken }, "🎗🐥");

      sendNotificationToUserOrLawyer(
        EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED,
        data,
        decodedToken,
        "COOPERATE_ACCESS",
        "REVOKED",
        "userAccessId"
      );
    }
  );
};
