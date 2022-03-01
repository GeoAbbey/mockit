import Joi from "joi";

export const createSmallClaimSchema = Joi.object().keys({
  claim: Joi.string(),
  venue: Joi.object().keys({
    country: Joi.string(),
    state: Joi.string(),
    street: Joi.string(),
  }),
  attachments: Joi.array().items(Joi.string()),
  amount: Joi.number().integer().min(0),
});

export const updateSmallClaimSchema = Joi.object().keys({
  claim: Joi.string(),
  venue: Joi.object().keys({
    country: Joi.string(),
    state: Joi.string(),
    street: Joi.string(),
  }),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  amount: Joi.number().integer().min(0).max(5000000),
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
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
