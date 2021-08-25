import Joi from "joi";

export const PaymentWithSubOrWalletSchema = Joi.object().keys({
  modelType: Joi.string()
    .valid("subscriptionCount", "smallClaim", "invitation", "cooperate")
    .required(),
  modelId: Joi.string()
    .guid({ version: "uuidv4" })
    .when("modelType", {
      is: ["smallClaim", "invitation"],
      then: Joi.required(),
    }),
  amount: Joi.number().when("modelType", {
    is: "cooperate",
    then: Joi.required(),
  }),
  quantity: Joi.number().when("modelType", {
    is: "subscriptionCount",
    then: Joi.required(),
  }),
  lawyerId: Joi.number().when("modelType", {
    is: "smallClaim",
    then: Joi.required(),
  }),
});

export const PayInSchema = Joi.object().keys({
  type: Joi.string()
    .valid("singleSmallClaim", "singleInvitation", "wallet", "subscription", "cooperate")
    .required(),
  amount: Joi.number().min(50),
  quantity: Joi.number().min(1).max(20),
  modelId: Joi.string().guid({ version: "uuidv4" }),
  callback_url: Joi.string(),
  lawyerId: Joi.string(),
});

export const PaymentAuthCodeSchema = PayInSchema.append({
  authCode: Joi.string().required(),
});

export const CooperateCode = Joi.object().keys({
  code: Joi.string().required(),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    ticketId: Joi.string(),
    for: Joi.string().valid(
      "response",
      "smallClaim",
      "invitation",
      "cooperate",
      "singleSmallClaim",
      "singleInvitation",
      "wallet",
      "subscription"
    ),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
