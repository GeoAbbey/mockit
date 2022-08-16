import Joi from "joi";

export const queryOptions = Joi.object().keys({
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
  search: Joi.object().keys({
    ticketId: Joi.string(),
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    modelType: Joi.string().valid("response", "invitation", "smallClaim"),
    from: Joi.date().less(Joi.ref("to")),
    to: Joi.date(),
  }),
});
