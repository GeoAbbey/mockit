import Joi from "joi";

export const createReportSchema = Joi.object().keys({
  content: Joi.string().required(),
  location: Joi.string(),
  attachments: Joi.array().items(Joi.any()),
});

export const updateReportSchema = Joi.object().keys({
  content: Joi.string(),
  location: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
});
