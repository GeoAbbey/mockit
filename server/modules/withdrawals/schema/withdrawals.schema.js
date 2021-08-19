import Joi from "joi";

export const createWithdrawalSchema = Joi.object().keys({
  number: Joi.number().required(),
});
