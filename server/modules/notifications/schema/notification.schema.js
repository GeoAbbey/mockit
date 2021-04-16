import Joi from "joi";

export const validNotificationUUIDs = Joi.object().keys({
  ids: Joi.array().items(Joi.string().guid({ version: "uuidv4" }).required()),
});
