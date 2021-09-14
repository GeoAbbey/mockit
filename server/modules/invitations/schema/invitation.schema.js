import Joi from "joi";

export const createInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.object().keys({
    country: Joi.string(),
    state: Joi.string(),
    street: Joi.string(),
  }),
  attachments: Joi.array().items(Joi.string()),
  dateOfVisit: Joi.date(),
});

export const updatedInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.object().keys({
    country: Joi.string(),
    state: Joi.string(),
    street: Joi.string(),
  }),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
  status: Joi.string().valid("in-progress", "completed"),
  dateOfVisit: Joi.date(),
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
