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
  modelType: Joi.string().valid("Invitation", "SmallClaim", "Responses"),
});
