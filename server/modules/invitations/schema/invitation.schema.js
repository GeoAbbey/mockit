import Joi from "joi";

export const createInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.string(),
  attachments: Joi.array().items(Joi.string()),
});

export const updatedInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }).required(),
  status: Joi.string().valid("in-progress", "completed"),
});
