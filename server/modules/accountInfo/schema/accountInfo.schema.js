import Joi from "joi";

export const AccountInfoSchema = Joi.object()
  .keys({
    walletAmount: Joi.number().integer().min(0),
    subscriptionCount: Joi.number().integer().min(0),
  })
  .xor("walletAmount", "subscriptionCount");

export const AccountParamsSchema = Joi.object().keys({
  ownerId: Joi.string().guid({ version: "uuidv4" }).required(),
  info: Joi.string().valid("wallet", "subscription").required(),
});
