import Joi from "joi";

export const createInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.string(),
  attachments: Joi.array().items(Joi.string()),
  dateOfVisit: Joi.date(),
});

export const updatedInvitationSchema = Joi.object().keys({
  reason: Joi.string(),
  venue: Joi.string(),
  attachments: [Joi.array().items(Joi.string()), Joi.number()],
  assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
  status: Joi.string().valid("in-progress", "completed"),
  dateOfVisit: Joi.date(),
});
