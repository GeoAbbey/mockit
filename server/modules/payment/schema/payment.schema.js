import Joi from "joi";

export const PaymentSchema = Joi.object().keys({
  modelType: Joi.string().valid("response", "smallClaim", "invitation").required(),
  modelId: Joi.string().guid({ version: "uuidv4" }).required(),
});
