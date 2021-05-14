import Joi from "joi";

export const visibilitySchema = Joi.object().keys({
  online: Joi.boolean().required(),
});
