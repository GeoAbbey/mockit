import debug from "debug";
import { EVENT_IDENTIFIERS, TEMPLATE } from "../../../constants";
import { sendTemplateEmail } from "../../../utils";
import UserService from "../../../modules/users/service/user.service";
import { notifyPeople } from "../helpers/notifyPeople";
import { data } from "./data";

const logger = debug("app:handlers:listeners:cooperate-access-events");

export const cooperateAccessEvents = (eventEmitter) => {
  eventEmitter.on(
    `${EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED}`,
    async ({ data: corporate, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED} events has been received`);

      const userToken = await UserService.findByPk(corporate.userAccessId);

      const notificationData = data.GRANTED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: corporate.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED,
        people: [userToken],
        notificationData,
      });

      sendTemplateEmail(
        userToken.dataValues.email,
        TEMPLATE.COOPERATE_ACCESS_GRANTED,
        { firstName: userToken.dataValues.firstName },
        corporate.ticketId
      );
    }
  );

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED}`,
    async ({ data: corporate, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED} events has been received`);

      const userToken = await UserService.findByPk(corporate.userAccessId);

      const notificationData = data.REVOKED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: corporate.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED,
        people: [userToken],
        notificationData,
      });

      sendTemplateEmail(
        userToken.dataValues.email,
        TEMPLATE.COOPERATE_ACCESS_REVOKED,
        { firstName: userToken.dataValues.firstName },
        corporate.ticketId
      );
    }
  );
};
