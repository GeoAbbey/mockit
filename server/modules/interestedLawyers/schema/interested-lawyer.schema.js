import Joi from "joi";

export const markInterestSchema = Joi.object().keys({
  baseCharge: Joi.number().min(0).required(),
  serviceCharge: Joi.number().min(0).required(),
});

export const allowedModelSchema = Joi.object().keys({
  modelType: Joi.string().valid("SmallClaim").required(),
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const updateMarkInterestSchema = Joi.object().keys({
  baseCharge: Joi.number().min(0),
  serviceCharge: Joi.number().min(0),
});
