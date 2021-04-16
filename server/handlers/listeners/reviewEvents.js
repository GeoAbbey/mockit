import debug from "debug";
import models from "../../models";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA } from "../../constants";
import { sendNotificationToClient } from "../../utils/sendNotificationToClient";

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

  const notice = [
    {
      for: EVENT_IDENTIFIERS.REVIEW.CREATED,
      ownerId: detailsToNotify.id,
      content: JSON.stringify(NOTIFICATION_DATA.REVIEW(mapper[review.modelType], action)),
    },
  ];

  logger("sending notification to the user");
  sendNotificationToClient({
    tokens: [detailsToNotify.firebaseToken],
    data: NOTIFICATION_DATA.REVIEW(mapper[review.modelType], action),
  });

  logger("saving notification sent to the user in the database");
  await models.Notification.bulkCreate(
    notice,
    NOTIFICATION_DATA.REVIEW(mapper[review.modelType], action)
  );
};
