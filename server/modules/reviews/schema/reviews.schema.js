import Joi from "joi";

export const createReviewSchema = Joi.object().keys({
  feedback: Joi.string(),
  rating: Joi.number().min(1).max(5).required(),
});

export const updateReviewSchema = Joi.object().keys({
  feedback: Joi.string(),
  rating: Joi.number().min(1).max(5),
});

export const queryReviewSchema = Joi.object().keys({
  search: Joi.object().keys({
    modelType: Joi.string().valid("Invitation", "SmallClaim", "Response"),
    reviewerId: Joi.string().guid({ version: "uuidv4" }),
    forId: Joi.string().guid({ version: "uuidv4" }),
    ticketId: Joi.string(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
