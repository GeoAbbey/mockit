import Joi from "joi";

export const markInterestSchema = Joi.object().keys({
  serviceCharge: Joi.number().min(0).required(),
});

export const allowedModelSchema = Joi.object().keys({
  modelType: Joi.string().valid("SmallClaim").required(),
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const updateMarkInterestSchema = Joi.object().keys({
  serviceCharge: Joi.number().min(0),
});
