import Joi from "joi";

export const queryOptions = Joi.object().keys({
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
