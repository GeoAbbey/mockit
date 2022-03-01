import Joi from "joi";

export const validNotificationUUIDs = Joi.object().keys({
  ids: Joi.array().items(Joi.string().guid({ version: "uuidv4" }).required()),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    for: Joi.string().valid(
      "INVITATION_CREATED",
      "INVITATION_ASSIGNED",
      "INVITATION_MARK_AS_COMPLETED",
      "REVIEW_CREATED",
      "REVIEW_EDITED",
      "REVIEW_DELETED",
      "SMALL_CLAIM_CREATED",
      "SMALL_CLAIM_PAID",
      "SMALL_CLAIM_ASSIGNED",
      "SMALL_CLAIM_MARK_INTEREST",
      "SMALL_CLAIM_MARK_AS_IN_PROGRESS",
      "SMALL_CLAIM_MARK_AS_COMPLETED",
      "RESPONSE_CREATED",
      "RESPONSE_DELETED",
      "RESPONSE_ASSIGNED",
      "MEET_TIME_CREATED",
      "RESPONSE_MARK_AS_COMPLETED",
      "USER_CREATED"
    ),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
