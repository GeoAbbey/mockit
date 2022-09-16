import Joi from "joi";

export const createPayoutSchema = Joi.object().keys({
  modelType: Joi.string().valid("response", "invitation", "smallClaim").required(),
  modelId: Joi.string().required(),
  text: Joi.string(),
  lawyerId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const recipientCodeSchema = Joi.object().keys({
  code: Joi.string().required(),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    ticketId: Joi.string(),
    lawyerId: Joi.string().guid({ version: "uuidv4" }),
    type: Joi.string().valid("response", "invitation", "smallClaim"),
    from: Joi.date().less(Joi.ref("to")),
    to: Joi.date(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
