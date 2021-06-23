import debug from "debug";
import { sendNotificationToClient } from "../../../utils/sendNotificationToClient";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA, ROLES } from "../../../constants";
import models from "../../../models";
const env = process.env.NODE_ENV || "development";
const configOptions = require("../../../config/config");

const config = configOptions[env];

const logger = debug("app:handlers:listeners:helpers");

export const sendNotificationToLawyers = async (events, data, decodedToken, modelName, action) => {
  logger(`${events} events has been received`);
  const allLawyers = await models.User.findAll({ where: { role: ROLES.LAWYER } });

  const tokens = [];
  const allNotices = [];
  allLawyers.forEach((lawyer) => {
    if (lawyer.firebaseToken) tokens.push(lawyer.firebaseToken);
    allNotices.push({
      for: EVENT_IDENTIFIERS[modelName][action],
      ownerId: lawyer.id,
      content: JSON.stringify(
        NOTIFICATION_DATA[modelName][action]({
          sender_id: data.dataValues.ownerId,
          status_id: data.dataValues.id,
          sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
          sender_firebase_token: decodedToken.firebaseToken,
        })
      ),
    });
  });

  logger("sending notification to qualified lawyers");
  config.runNotificationService &&
    sendNotificationToClient({
      tokens,
      data: NOTIFICATION_DATA[modelName][action]({
        sender_id: data.dataValues.ownerId,
        status_id: data.dataValues.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        sender_firebase_token: decodedToken.firebaseToken,
      }),
    });

  logger("saving notification for qualified lawyers on the database");
  await models.Notification.bulkCreate(
    allNotices,
    NOTIFICATION_DATA[modelName][action]({
      sender_id: data.dataValues.ownerId,
      status_id: data.dataValues.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      sender_firebase_token: decodedToken.firebaseToken,
    })
  );
};

export const sendNotificationToUserOrLawyer = async (
  events,
  data,
  decodedToken,
  modelName,
  action,
  context
) => {
  logger(`${events} events has been received`);
  const modelOwner = await models.User.findByPk(data[context]);

  const { firebaseToken, id } = modelOwner.dataValues;

  const tokens = [firebaseToken];
  const notice = [
    {
      for: EVENT_IDENTIFIERS[modelName][action],
      ownerId: id,
      content: JSON.stringify(
        NOTIFICATION_DATA[modelName][action]({
          sender_id: data.dataValues.ownerId,
          status_id: data.dataValues.id,
          sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
          sender_firebase_token: decodedToken.firebaseToken,
        })
      ),
    },
  ];

  logger("sending notification to the user");
  config.runNotificationService &&
    sendNotificationToClient({
      tokens,
      data: NOTIFICATION_DATA[modelName][action]({
        sender_id: data.dataValues.ownerId,
        status_id: data.dataValues.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        sender_firebase_token: decodedToken.firebaseToken,
      }),
    });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(
    notice,
    NOTIFICATION_DATA[modelName][action]({
      sender_id: data.dataValues.ownerId,
      status_id: data.dataValues.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      sender_firebase_token: decodedToken.firebaseToken,
    })
  );
};

export const layerMarkInterestOrUpdateStatusForClaim = async (
  events,
  data,
  decodedToken,
  action
) => {
  logger(`${events} events has been received`);

  const caseOfInterest = await models[data.modelType].findByPk(data.modelId, {
    include: [
      {
        model: models.User,
        as: "ownerProfile",
        attributes: ["firebaseToken", "id"],
        required: false,
      },
      {
        model: models.User,
        as: "lawyerProfile",
        attributes: ["firebaseToken", "id"],
        required: false,
      },
    ],
  });

  const { ownerProfile, lawyerProfile } = caseOfInterest.dataValues;

  const notice = [
    {
      for: EVENT_IDENTIFIERS.SMALL_CLAIM[action],
      ownerId: ownerProfile.id,
      content: JSON.stringify(
        NOTIFICATION_DATA.SMALL_CLAIM[action]({
          sender_id: data.dataValues.ownerId,
          status_id: data.dataValues.id,
          sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
          sender_firebase_token: decodedToken.firebaseToken,
        })
      ),
    },
  ];

  logger("sending notification to the user");
  config.runNotificationService &&
    sendNotificationToClient({
      tokens: [ownerProfile.firebaseToken],
      data: NOTIFICATION_DATA.SMALL_CLAIM[action]({
        sender_id: data.dataValues.ownerId,
        status_id: data.dataValues.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        sender_firebase_token: decodedToken.firebaseToken,
      }),
    });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(
    notice,
    NOTIFICATION_DATA.SMALL_CLAIM[action]({
      sender_id: data.dataValues.ownerId,
      status_id: data.dataValues.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      sender_firebase_token: decodedToken.firebaseToken,
    })
  );
};

export const sendNotificationToEligibleLawyers = async ({
  events,
  lawyersToNotify,
  response,
  startingLocation,
  decodedToken,
}) => {
  logger(`${events} events has been received`);

  const allNotices = [];
  const tokens = [];

  lawyersToNotify.forEach((lawyer) => {
    if (lawyer.firebaseToken) tokens.push(lawyer.firebaseToken);
    allNotices.push({
      for: events,
      ownerId: lawyer.id,
      content: JSON.stringify(
        NOTIFICATION_DATA.RESPONSE.CREATED({
          sender_id: response.dataValues.ownerId,
          status_id: response.dataValues.id,
          sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
          sender_firebase_token: decodedToken.firebaseToken,
          startingLocation,
        })
      ),
    });
  });

  logger("sending notification to all eligible lawyers");
  config.runNotificationService &&
    sendNotificationToClient({
      tokens: tokens,
      data: NOTIFICATION_DATA.RESPONSE.CREATED({
        sender_id: response.dataValues.ownerId,
        status_id: response.dataValues.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        sender_firebase_token: decodedToken.firebaseToken,
        startingLocation,
      }),
    });

  logger("saving notification sent to eligible lawyers in the database");
  await models.Notification.bulkCreate(
    allNotices,
    NOTIFICATION_DATA.RESPONSE.CREATED({
      sender_id: response.dataValues.ownerId,
      status_id: response.dataValues.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      sender_firebase_token: decodedToken.firebaseToken,
      startingLocation,
    })
  );
};
