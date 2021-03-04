import { AccessControl } from "accesscontrol";
import { grantsObject } from "./grantsObject";
import createError from "http-errors";
import models from "../models";

class Permissions {
  static instance;
  static grantsObject = grantsObject;
  static AccessControl = AccessControl;

  static getInstance() {
    if (!Permissions.instance) {
      Permissions.instance = new Permissions();
    }
    return Permissions.instance;
  }

  constructor() {
    this.AccessControl = AccessControl;
    this.grantsObject = grantsObject;
  }

  getGrants() {
    const grants = new this.AccessControl(this.grantsObject);
    return grants;
  }

  checkPermissionMiddleware() {
    return async (req, res, next) => {
      const { role } = req.decodedToken;
      if (role === "super-admin") next();

      if (role === "admin") {
        if (req.body.role === "admin")
          return next(
            createError(
              403,
              "you do not have access to perform this operation, as an admin make an admin"
            )
          );
        next();
      }

      if (role === "lawyer" || role === "user") {
        if (req.decodedToken.id !== req.user.id)
          return next(
            createError(403, "you do not have access to perform this operation, not own object")
          );
        if (req.body.isAccountSuspended === true || req.body.isAccountSuspended === false)
          return next(
            createError(
              403,
              "you do not have access to perform this operation, is Account Suspended"
            )
          );
        if (req.body.lawyerDocuments) {
          if (
            req.body.lawyerDocuments.isLawyerVerified === true ||
            req.body.lawyerDocuments.isLawyerVerified === false
          ) {
            return next(
              createError(
                403,
                "you do not have access to perform this operation, is lawyer Documents"
              )
            );
          }
        }

        if (req.body.role)
          return next(
            createError(403, "you do not have access to perform this operation, is bad role")
          );

        next();
      }
    };
  }
}

export default Permissions.getInstance();
