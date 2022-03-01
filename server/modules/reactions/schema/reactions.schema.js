import Joi from "joi";

export const allowedReactionSchema = Joi.object().keys({
  modelType: Joi.string().valid("Comment", "Report").required(),
  reactionType: Joi.string().valid("like", "repost").required(),
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});
