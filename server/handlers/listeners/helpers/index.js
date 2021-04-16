import debug from "debug";
import { sendNotificationToClient } from "../../../utils/sendNotificationToClient";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA, ROLES } from "../../../constants";
import models from "../../../models";

const logger = debug("app:handlers:listeners:helpers");

export const sendNotificationToLawyers = async (events, data, modelName, action) => {
  logger(`${events} events has been received`);
  const allLawyers = await models.User.findAll({ where: { role: ROLES.LAWYER } });

  const tokens = [];
  const allNotices = [];
  allLawyers.forEach((lawyer) => {
    if (lawyer.firebaseToken) tokens.push(lawyer.firebaseToken);
    allNotices.push({
      for: EVENT_IDENTIFIERS[modelName][action],
      ownerId: lawyer.id,
      content: JSON.stringify(NOTIFICATION_DATA[modelName][action]),
    });
  });

  logger("sending notification to qualified lawyers");
  sendNotificationToClient({ tokens, data: NOTIFICATION_DATA[modelName][action] });

  logger("saving notification for qualified lawyers on the database");
  await models.Notification.bulkCreate(allNotices, NOTIFICATION_DATA[modelName][action]);
};

export const sendNotificationToUserOrLawyer = async (events, data, modelName, action, context) => {
  logger(`${events} events has been received`);
  const modelOwner = await models.User.findByPk(data[context]);

  const { firebaseToken: userToken, id: userId } = modelOwner.dataValues;

  const tokens = [userToken];
  const notice = [
    {
      for: EVENT_IDENTIFIERS[modelName][action],
      ownerId: userId,
      content: JSON.stringify(NOTIFICATION_DATA[modelName][action]),
    },
  ];

  logger("sending notification to the user");
  sendNotificationToClient({ tokens, data: NOTIFICATION_DATA[modelName][action] });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(notice, NOTIFICATION_DATA[modelName][action]);
};

export const layerMarkInterestForClaim = async (events, data) => {
  logger(`${events} events has been received`);

  const caseOdInterest = await models[data.modelType].findByPk(data.modelId, {
    include: [
      {
        model: models.User,
        as: "ownerProfile",
        attributes: ["firebaseToken", "id"],
        required: false,
      },
    ],
  });

  const { ownerProfile } = caseOdInterest.dataValues;

  const notice = [
    {
      for: EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST,
      ownerId: ownerProfile.id,
      content: JSON.stringify(NOTIFICATION_DATA.SMALL_CLAIM.MARK_INTEREST),
    },
  ];

  logger("sending notification to the user");
  sendNotificationToClient({
    tokens: [ownerProfile.firebaseToken],
    data: NOTIFICATION_DATA.SMALL_CLAIM.MARK_INTEREST,
  });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(notice, NOTIFICATION_DATA.SMALL_CLAIM.MARK_INTEREST);
};
