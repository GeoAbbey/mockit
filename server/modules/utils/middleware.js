import Joi from "joi";

export const middleware = ({ schema, property }) => {
  return (req, res, next) => {
    // const { error } = Joi.validate(req[property], schema);
    const { error } = schema.validate(req[property]);
    const valid = error == null;
    if (!valid) {
      const { details } = error;
      return res.status(422).send({ err: details });
    }
    next();
  };
};
