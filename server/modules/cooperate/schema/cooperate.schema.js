import Joi from "joi";

export const createCooperateSchema = Joi.object().keys({
  companyName: Joi.string().required(),
  companyAddress: Joi.string().required(),
  companyEmail: Joi.string().email({ minDomainSegments: 2 }).required(),
  contactName: Joi.string().required(),
  contactPhone: Joi.string()
    .pattern(/^(0|\+234)\d{10}$/)
    .required(),
});
