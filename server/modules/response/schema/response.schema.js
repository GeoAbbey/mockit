import Joi from "joi";

export const updateResponseSchema = Joi.object().keys({
  meetTime: Joi.boolean(),
  assignedLawyerId: Joi.string(),
  bid: Joi.boolean(),
});
