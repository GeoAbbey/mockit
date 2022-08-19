import Joi from "joi";

export const createMileStoneSchema = Joi.object().keys({
  claimId: Joi.string().guid({ version: "uuidv4" }).required(),
  mileStones: Joi.array()
    .items(
      Joi.object().keys({
        title: Joi.string().required(),
        content: Joi.string().required(),
        percentage: Joi.number().required(),
      })
    )
    .max(4),
});

export const modifyMileStoneSchema = Joi.object().keys({
  title: Joi.string(),
  content: Joi.string(),
  status: Joi.string().valid("completed"),
});
