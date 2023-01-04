import Joi from "joi";

export const createWithdrawalSchema = Joi.object().keys({
  amount: Joi.number().min(1000).required(),
});

export const finalizeOTP = Joi.object().keys({
  otp: Joi.string().required(),
  reference: Joi.string().required(),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    ticketId: Joi.string(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});

export const referenceSchema = Joi.object().keys({
  reference: Joi.string().required(),
});
