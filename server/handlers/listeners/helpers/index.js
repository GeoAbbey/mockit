import debug from "debug";
import { sendNotificationToClient } from "../../../utils/sendNotificationToClient";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA, ROLES, TEMPLATE } from "../../../constants";
import models from "../../../models";
import { sendBulkMail, sendMail } from "../../../utils/MailService";

const logger = debug("app:handlers:listeners:helpers");

export const layerMarkInterestOrUpdateStatusForClaim = async (
  events,
  data,
  decodedToken,
  action
) => {
  logger(`${events} events has been received`);

  const caseOfInterest = await models.SmallClaim.findByPk(data.claimId, {
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
      for: EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST,
      ownerId: ownerProfile.id,
      content: JSON.stringify(
        NOTIFICATION_DATA.SMALL_CLAIM[action]({
          sender_id: data.dataValues.ownerId,
          status_id: data.dataValues.modelId,
          sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
          sender_firebase_token: decodedToken.firebaseToken,
        })
      ),
    },
  ];

  logger("sending notification to the user");
  if (action === "MARK_INTEREST")
    sendMail({
      email: ownerProfile.email,
      templateId: TEMPLATE.SMALL_CLAIM_INTEREST,
      firstName: ownerProfile.firstName,
    });

  sendNotificationToClient({
    tokens: [ownerProfile.firebaseToken],
    data: NOTIFICATION_DATA.SMALL_CLAIM[action]({
      sender_id: decodedToken.id,
      status_id: data.dataValues.modelId,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      sender_firebase_token: decodedToken.firebaseToken,
    }),
  });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(
    notice,
    NOTIFICATION_DATA.SMALL_CLAIM[action]({
      sender_id: data.dataValues.ownerId,
      status_id: data.dataValues.modelId,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      sender_firebase_token: decodedToken.firebaseToken,
    })
  );
};

export const sendNotificationToEligibleLawyers = async ({
  io,
  events,
  lawyersToNotify,
  response,
  startingLocation,
  decodedToken,
}) => {
  logger(`${events} events has been received`);

  const allNotices = [];
  const tokens = [];
  const socketIDs = [];

  lawyersToNotify.forEach((lawyer) => {
    if (lawyer.firebaseToken) tokens.push(lawyer.firebaseToken);
    if (lawyer.socketId) socketIDs.push(lawyer.socketId);
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

  const personalizations = lawyersToNotify.map((lawyer) => ({
    to: [{ email: lawyer.email }],
    dynamic_template_data: {
      firstName: lawyer.firstName,
    },
  }));

  sendBulkMail({ personalizations, templateId: TEMPLATE.ELIGIBLE_LAWYERS });

  logger("sending notification to all eligible lawyers");
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

  socketIDs.forEach((id) => {
    io.to(id).emit(
      EVENT_IDENTIFIERS.RESPONSE.CREATED,
      NOTIFICATION_DATA.RESPONSE.CREATED({
        sender_id: response.dataValues.ownerId,
        status_id: response.dataValues.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        sender_firebase_token: decodedToken.firebaseToken,
        startingLocation,
      })
    );
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
