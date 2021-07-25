import Joi from "joi";

export const EmailAccess = Joi.object().keys({
  userEmail: Joi.string().email({ minDomainSegments: 2 }).required(),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    userEmail: Joi.string(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
