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

export const editCooperateSchema = Joi.object().keys({
  companyName: Joi.string(),
  companyAddress: Joi.string(),
  companyEmail: Joi.string().email({ minDomainSegments: 2 }),
  contactName: Joi.string(),
  contactPhone: Joi.string().pattern(/^(0|\+234)\d{10}$/),
});
