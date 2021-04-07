import Joi from "joi";

export const createSmallClaimSchema = Joi.object().keys({
  claim: Joi.string().required(),
  venue: Joi.string().required(),
  attachments: Joi.array().items(Joi.string()),
  amount: Joi.number().integer().min(0).required(),
});

export const updateSmallClaimSchema = Joi.object().keys({
  claim: Joi.string(),
  venue: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  amount: Joi.number().integer().min(0).max(5000000),
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
});

export const markInterestSchema = Joi.object().keys({
  baseCharge: Joi.number().min(0).required(),
  serviceCharge: Joi.number().min(0).required(),
});
