import debug from "debug";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA, TEMPLATE, ROLES } from "../../constants";
import userService from "../../modules/users/service/user.service";
import { sendBulkTemplatedEmail } from "../../utils/MailService";
import { sendNotificationToClient } from "../../utils/sendNotificationToClient";
import { sendNotificationToUserOrLawyer } from "./helpers";
const logger = debug("app:handlers:listeners:withdrawal-events");

export const withdrawalEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.WITHDRAWAL.INITIATED}`, async ({ data, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.WITHDRAWAL.INITIATED} events has been received`);

    const admins = await userService.findMany({
      role: ROLES.ADMIN,
    });

    const tokens = [];
    const allNotices = [];
    const notificationData = NOTIFICATION_DATA.WITHDRAWAL.INITIATED({
      sender_id: data.dataValues.ownerId,
      status_id: data.dataValues.id,
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
    sendBulkTemplatedEmail(admins, TEMPLATE.WITHDRAWAL_INITIATED, {
      ticketId: data.ticketId,
      amount: data.amount,
    });
  });

  eventEmitter.on(`${EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED}`, async ({ data, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED} events has been received`);
    console.log({ data, decodedToken }, "🧩");

    //send notification of successful to the lawyer
    //send email of successful disbursement to the lawyer
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED,
      data,
      decodedToken,
      "WITHDRAWAL",
      "AUTHORIZED",
      "ownerId"
    );
  });
};
