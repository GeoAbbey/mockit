import Joi from "joi";

export const PaymentWithSubOrWalletSchema = Joi.object().keys({
  modelType: Joi.string().valid("response", "smallClaim", "invitation").required(),
  modelId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const PayInSchema = Joi.object().keys({
  type: Joi.string()
    .valid("singleSmallClaim", "singleInvitation", "wallet", "subscription", "cooperate")
    .required(),
  amount: Joi.number().min(50),
  quantity: Joi.number().min(1).max(20),
  modelId: Joi.string().guid({ version: "uuidv4" }),
  callback_url: Joi.string(),
});

export const PaymentAuthCodeSchema = PayInSchema.append({
  authCode: Joi.string().required(),
});

export const CooperateCode = Joi.object().keys({
  code: Joi.string().required(),
});
