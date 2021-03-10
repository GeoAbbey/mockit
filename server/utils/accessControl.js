import { AccessControl } from "accesscontrol";
import { grantsObject } from "./grantsObject";
import createError from "http-errors";
import debug from "debug";

const log = debug("app:accessControl");

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

  checkPermissionAdminAccess() {
    return async (req, res, next) => {
      log("checking admin access to perform a certain operation");
      const { role } = req.decodedToken;
      if (role !== "super-admin" && role !== "admin")
        return next(createError(403, "you do not have access to perform this operation"));

      if (role === "admin" && req.body.role === "admin") {
        return next(
          createError(
            403,
            "you do not have access to perform this operation, as an admin make an admin"
          )
        );
      }

      next();
    };
  }

  checkPermissionUserOrLawyerAccess() {
    return (req, res, next) => {
      log("checking user or lawyer access to perform a certain operation");
      const { role } = req.decodedToken;
      if (role !== "lawyer" && role !== "user")
        return next(createError(403, "to perform this operation make use of the admin route"));

      if (req.body.isAccountSuspended === true || req.body.isAccountSuspended === false)
        return next(
          createError(403, "you do not have access to perform this operation, is Account Suspended")
        );
      if (req.body.lawyer) {
        if (req.body.lawyer.isVerified === true || req.body.lawyer.isVerified === false) {
          return next(
            createError(
              403,
              "you do not have access to perform this operation, is lawyer Documents"
            )
          );
        }
      }

      const roleOrEmailOrVerified = req.body.role || req.body.email;
      if (roleOrEmailOrVerified)
        return next(
          createError(
            403,
            `you do not have access to perform this operation, you can't modify to a  ${roleOrEmailOrVerified}`
          )
        );
      next();
    };
  }
}

export default Permissions.getInstance();
