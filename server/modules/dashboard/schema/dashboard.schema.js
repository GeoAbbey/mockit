import Joi from "joi";

export const queryOptions = Joi.object().keys({
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
  from: Joi.date().less(Joi.ref("to")),
  to: Joi.date(),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});

export const dateOptions = Joi.object({
  from: Joi.date().less(Joi.ref("to")),
  to: Joi.date(),
});
