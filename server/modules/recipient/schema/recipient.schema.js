import Joi from "joi";

export const createRecipientSchema = Joi.object().keys({
  account_number: Joi.string().required(),
  bank_code: Joi.string().required(),
  account_name: Joi.string().required(),
});

export const recipientSchema = Joi.object().keys({
  account_number: Joi.string(),
  bank_code: Joi.string(),
});
