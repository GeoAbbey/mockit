import Joi from "joi";

export const createPayoutSchema = Joi.object().keys({
  modelType: Joi.string().valid("response", "invitation", "smallClaim").required(),
  modelId: Joi.string().required(),
  text: Joi.string(),
  lawyerId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const recipientCodeSchema = Joi.object().keys({
  code: Joi.string().required(),
});
