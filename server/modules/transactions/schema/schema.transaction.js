import Joi from "joi";

export const TransactionSchema = Joi.object().keys({
  amount: Joi.number().integer().min(0).required(),
  modelId: Joi.string().guid({ version: "uuidv4" }).required(),
  modelType: Joi.string().valid("small-claim", "invitation", "response").required(),
});
