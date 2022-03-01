import Joi from "joi";

export const createEligibleLawyerSchema = Joi.object().keys({
  responseId: Joi.string().guid({ version: "uuidv4" }),
  lawyerId: Joi.string().guid({ version: "uuidv4" }),
});

export const filterEligibleLawyerSchema = Joi.object()
  .keys({
    responseId: Joi.string().guid({ version: "uuidv4" }),
    lawyerId: Joi.string().guid({ version: "uuidv4" }),
  })
  .oxor("responseId", "lawyerId");
