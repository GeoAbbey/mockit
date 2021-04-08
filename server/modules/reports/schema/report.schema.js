import Joi from "joi";

export const createReportSchema = Joi.object().keys({
  content: Joi.string().required(),
  attachments: Joi.array().items(Joi.string()),
});

export const updateReportSchema = Joi.object().keys({
  content: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
});
