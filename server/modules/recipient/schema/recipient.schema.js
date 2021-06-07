import Joi from "joi";

export const createRecipientSchema = Joi.object().keys({
  type: Joi.string().valid("nuban").required(),
  description: Joi.string().required(),
  account_number: Joi.string().required(),
  bank_code: Joi.string().required(),
  currency: Joi.string().valid("NGN").required(),
});
