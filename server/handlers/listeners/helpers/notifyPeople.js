import debug from "debug";
import models from "../../../models";
import { sendNotificationToClient } from "../../../utils/sendNotificationToClient";

const logger = debug("server:handlers:listeners:helpers:notifyPeople");

export const notifyPeople = async ({ event, people, notificationData }) => {
  logger(`${event} has been received`);
  const tokens = [];
  const allNotices = [];
  // const data = { ...notificationData }; // this is necessary as sequelize adds model property to notificationData;

  people.forEach((person) => {
    if (person.firebaseToken) tokens.push(person.firebaseToken);
    allNotices.push({
      for: event,
      ownerId: person.id,
      content: JSON.stringify(notificationData),
    });
  });

  logger("sending notification to qualified people");
  await sendNotificationToClient({
    tokens,
    data: notificationData,
  });

  logger("saving notification for qualified people on the database");
  await models.Notification.bulkCreate(allNotices, notificationData);
};
