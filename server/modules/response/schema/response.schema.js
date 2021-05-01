import Joi from "joi";

export const updateResponseSchema = Joi.object().keys({
  meetTime: Joi.boolean(),
  assignedLawyerId: Joi.string(),
  bid: Joi.boolean(),
});

export const createResponseSchema = Joi.object().keys({
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
});
