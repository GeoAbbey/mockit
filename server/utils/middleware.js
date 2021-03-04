import createError from "http-errors";
import debug from "debug";

const log = debug("app:modules:utils:middleware");

export const middleware = ({ schema, property }) => {
  return (req, res, next) => {
    log(`performing a validation on ${req[property]} with ${schema}`);
    const { error } = schema.validate(req[property]);
    const valid = error == null;
    if (!valid) {
      const { details } = error;
      return next(createError(403, { err: details }));
    }
    next();
  };
};
