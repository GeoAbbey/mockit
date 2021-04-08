import Joi from "joi";

export const createCommentSchema = Joi.object().keys({
  content: Joi.string().required(),
});
