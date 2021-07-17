import Joi from "joi";

export const updateResponseSchema = Joi.object().keys({
  meetTime: Joi.boolean(),
  assignedLawyerId: Joi.string(),
  bid: Joi.boolean(),
});

export const createResponseSchema = Joi.object().keys({
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
    ticketId: Joi.string(),
    status: Joi.string().valid("completed", "in-progress", "initiated"),
    paid: Joi.boolean(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
