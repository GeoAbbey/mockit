import Joi from "joi";

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    type: Joi.string().valid(
      "singleSmallClaim",
      "singleInvitation",
      "wallet",
      "subscription",
      "cooperate"
    ),
    ownerId: Joi.string().guid({ version: "uuidv4" }),
    ticketId: Joi.string(),
    reference: Joi.string(),
    from: Joi.date().less(Joi.ref("to")),
    to: Joi.date(),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});
