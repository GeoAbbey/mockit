import Joi from "joi";

export const createInvitationSchema = Joi.object().keys({
  reason: Joi.string().required(),
  venue: Joi.string().required(),
  attachments: Joi.array().items(Joi.string()),
});

export const updatedInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  status: Joi.string(),
  assignedLawyerId: Joi.string(),
  status: Joi.string().valid("in-progress", "completed"),
});

export const markAsCompletedSchema = Joi.object().keys({
  status: Joi.string().valid("completed").required(),
});
