import Joi from "joi";

export const validateUUID = Joi.object().keys({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const allowedModelSchema = Joi.object().keys({
  modelType: Joi.string().valid("Invitation", "SmallClaim", "Response").required(),
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const queryContextParams = Joi.object()
  .keys({
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    assignedLawyerId: Joi.string().guid({ version: "uuidv4" }),
  })
  .oxor("ownerId", "assignedLawyerId");
