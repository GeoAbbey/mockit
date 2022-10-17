import debug from "debug";
import models from "../../models";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA, TEMPLATE } from "../../constants";
import { sendNotificationToClient } from "../../utils/sendNotificationToClient";
import { sendMail } from "../../utils";

const logger = debug("app:handlers:listeners:review-events");

export const reviewEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.REVIEW.CREATED, async (review) => {
    notifyForReviews(EVENT_IDENTIFIERS.REVIEW.CREATED, review, "CREATED");
  });
  eventEmitter.on(EVENT_IDENTIFIERS.REVIEW.EDITED, async (review) => {
    notifyForReviews(EVENT_IDENTIFIERS.REVIEW.EDITED, review, "EDITED");
  });
};

const notifyForReviews = async (events, review, action) => {
  logger(`${events} events has been received`);

  const mapper = {
    Invitation: "police invitation",
    SmallClaim: "small claim",
    Response: "response",
  };

  const reviewedCase = await models[review.modelType].findByPk(review.modelId, {
    include: [
      {
        model: models.User,
        as: "lawyerProfile",
        attributes: ["firebaseToken", "id"],
        required: false,
      },
      {
        model: models.User,
        as: "ownerProfile",
        attributes: ["firebaseToken", "id"],
        required: false,
      },
    ],
  });
  const { lawyerProfile, ownerProfile } = reviewedCase;
  const detailsToNotify =
    review.reviewerId === lawyerProfile.dataValues.id
      ? ownerProfile.dataValues
      : lawyerProfile.dataValues;

  const notificationFrom =
    review.reviewerId === lawyerProfile.dataValues.id
      ? lawyerProfile.dataValues
      : ownerProfile.dataValues;

  const notice = [
    {
      for: EVENT_IDENTIFIERS.REVIEW.CREATED,
      ownerId: detailsToNotify.id,
      content: JSON.stringify(
        NOTIFICATION_DATA.REVIEW({
          context: mapper[review.modelType],
          action,
          to: notificationFrom.firebaseToken,
          id: notificationFrom.id,
        })
      ),
    },
  ];

  logger("sending notification to the user");
  sendMail({
    firstName: detailsToNotify.firstName,
    email: detailsToNotify.email,
    templateId: TEMPLATE.REVIEW_CREATED,
  });

  sendNotificationToClient({
    tokens: [detailsToNotify.firebaseToken],
    data: NOTIFICATION_DATA.REVIEW({
      context: mapper[review.modelType],
      action,
      to: notificationFrom.firebaseToken,
      id: notificationFrom.id,
    }),
  });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(
    notice,
    NOTIFICATION_DATA.REVIEW({
      context: mapper[review.modelType],
      action,
      to: notificationFrom.firebaseToken,
      id: notificationFrom.id,
    })
  );
};
