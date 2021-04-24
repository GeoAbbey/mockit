import Joi from "joi";

export const createSmallClaimSchema = Joi.object().keys({
  claim: Joi.string(),
  venue: Joi.string(),
  attachments: Joi.array().items(Joi.string()),
  amount: Joi.number().integer().min(0),
});

export const updateSmallClaimSchema = Joi.object().keys({
  claim: Joi.string(),
  venue: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  amount: Joi.number().integer().min(0).max(5000000),
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
});
