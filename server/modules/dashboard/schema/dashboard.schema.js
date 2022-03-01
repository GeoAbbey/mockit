import Joi from "joi";

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
