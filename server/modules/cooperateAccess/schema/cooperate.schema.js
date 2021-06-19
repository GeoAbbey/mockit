import Joi from "joi";

export const CooperateAccessIds = (identifier) =>
  Joi.object().keys({
    [identifier]: Joi.array().items(Joi.string().guid({ version: "uuidv4" }).required()),
  });
