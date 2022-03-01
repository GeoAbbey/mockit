import Joi from "joi";

export const createReportSchema = Joi.object().keys({
  content: Joi.string(),
  location: Joi.string(),
  attachments: Joi.array().items(Joi.any()),
});

export const updateReportSchema = Joi.object().keys({
  content: Joi.string(),
  location: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    reporterId: Joi.string().guid({ version: "uuidv4" }),
    ticketId: Joi.string(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
