import Joi from "joi";

export const createReviewSchema = Joi.object().keys({
  feedback: Joi.string(),
  rating: Joi.number().min(1).max(5).required(),
});

export const updateReviewSchema = Joi.object().keys({
  feedback: Joi.string(),
  rating: Joi.number().min(1).max(5),
});

export const allowedModelSchema = Joi.object().keys({
  modelName: Joi.string().valid("Invitation").required(),
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const queryReviewSchema = Joi.object().keys({
  modelName: Joi.string().valid("Invitation"),
});
