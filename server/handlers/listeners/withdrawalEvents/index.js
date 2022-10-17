import debug from "debug";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA, TEMPLATE, ROLES } from "../../../constants";
import userService from "../../../modules/users/service/user.service";
import { sendNotificationToClient } from "../../../utils/sendNotificationToClient";
import UserService from "../../../modules/users/service/user.service";
import { data } from "./data";
import { notifyPeople } from "../helpers/notifyPeople";
const logger = debug("app:handlers:listeners:withdrawal-events");

export const withdrawalEvents = (eventEmitter) => {
  eventEmitter.on(
    `${EVENT_IDENTIFIERS.WITHDRAWAL.INITIATED}`,
    async ({ data: withdrawal, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.WITHDRAWAL.INITIATED} events has been received`);

      const admins = await userService.findMany({
        role: ROLES.ADMIN,
      });

      const tokens = [];
      const allNotices = [];

      const notificationData = data.INITIATED({
        sender_id: withdrawal.dataValues.ownerId,
        status_id: withdrawal.dataValues.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      admins.forEach((admin) => {
        if (admin.firebaseToken) tokens.push(admin.firebaseToken);
        allNotices.push({
          for: EVENT_IDENTIFIERS.WITHDRAWAL.INITIATED,
          ownerId: admin.id,
          content: JSON.stringify(notificationData),
        });
      });

      //send notification to all admins
      logger("sending notification to all admins");
      sendNotificationToClient({
        tokens,
        data: notificationData,
      });

      //send emails to all admins
      // sendBulkTemplatedEmail(admins, TEMPLATE.WITHDRAWAL_INITIATED, {
      //   ticketId: withdrawal.ticketId,
      //   amount: withdrawal.amount,
      // });
    }
  );

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED}`,
    async ({ data: withdrawal, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED} events has been received`);
      console.log({ data, decodedToken }, "🧩");

      //send notification of success to the lawyer
      //send email of successful disbursement to the lawyer
      const userToken = await UserService.findByPk(withdrawal.ownerId);

      const notificationData = data.AUTHORIZED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: withdrawal.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED,
        people: [userToken],
        notificationData,
      });

      // sendTemplateEmail(userToken.email, TEMPLATE.WITHDRAWAL_AUTHORIZED, {
      //   firstName: userToken.firstName,
      //   email: userToken.email,
      //   ticketId: withdrawal.ticketId,
      //   amount: withdrawal.amount,
      // });
    }
  );
};
