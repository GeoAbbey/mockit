import Joi from "joi";

export const createInvitationSchema = Joi.object().keys({
  reason: Joi.string().required(),
  venue: Joi.string().required(),
  attachments: Joi.array().items(Joi.string()),
});
