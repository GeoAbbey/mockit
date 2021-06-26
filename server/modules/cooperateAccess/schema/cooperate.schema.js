import Joi from "joi";

export const EmailAccess = Joi.object().keys({
  userEmail: Joi.string().email({ minDomainSegments: 2 }).required(),
});
