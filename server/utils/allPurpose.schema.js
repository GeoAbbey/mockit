import Joi from "joi";

export const validateUUID = Joi.object().keys({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const allowedModelSchema = Joi.object().keys({
  modelType: Joi.string().valid("Invitation", "SmallClaim").required(),
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});
