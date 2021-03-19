import Joi from "joi";

export const validateUUID = Joi.object().keys({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});
