import Joi from "joi";

export const TransactionSchema = Joi.object().keys({
  amount: Joi.number().integer().min(0).required(),
  modelId: Joi.string().guid({ version: "uuidv4" }).required(),
  modelType: Joi.string().valid("small-claim", "invitation", "response").required(),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    type: Joi.string().valid("small-claim", "invitation", "response"),
    ticketId: Joi.string(),
    code: Joi.string(),
    notes: Joi.string(),
    from: Joi.date().less(Joi.ref("to")),
    to: Joi.date(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
