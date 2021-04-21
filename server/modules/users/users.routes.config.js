import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
  validOTP,
  validOtpAndPassword,
  newOTP,
} from "./schema/users.schema";
import {
  middleware,
  wrapCatch,
  Authenticate,
  AccessControl,
  validateUUID,
  uploadMiddleware,
} from "../../utils";

export class UserRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "UserRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/users/login`)
      .post([
        middleware({ schema: loginUserSchema, property: "body" }),
        wrapCatch(UsersController.login),
      ]);
    this.app
      .route(`${this.path}/users/signup`)
      .post([
        middleware({ schema: createUserSchema, property: "body" }),
        UsersController.userExistMiddleware("signup"),
        wrapCatch(UsersController.signUp),
      ]);

    this.app
      .route(`${this.path}/users/profile`)
      .all([Authenticate.verifyToken])
      .patch([
        uploadMiddleware("profilePic"),
        // middleware({ schema: updateUserSchema, property: "body" }),
        UsersController.userExistMiddleware(),
        AccessControl.checkPermissionUserOrLawyerAccess(),
        UsersController.updateUser,
      ])
      .get([
        AccessControl.checkPermissionUserOrLawyerAccess(),
        UsersController.userExistMiddleware("getProfile"),
      ]);

    this.app
      .route(`${this.path}/users/new-otp`)
      .all([
        middleware({ schema: newOTP, property: "query" }),
        UsersController.userExistMiddleware(),
      ])
      .post([UsersController.generateNewOtp]);

    this.app
      .route(`${this.path}/users/verify`)
      .all([Authenticate.verifyToken, UsersController.userExistMiddleware()])
      .patch([
        middleware({ schema: validOTP, property: "body" }),
        AccessControl.checkPermissionUserOrLawyerAccess(),
        UsersController.validateOTP,
        UsersController.verifyEmail,
      ]);

    this.app
      .route(`${this.path}/users/reset-password`)
      .all([UsersController.userExistMiddleware()])
      .patch([
        middleware({ schema: validOtpAndPassword, property: "body" }),
        UsersController.validateOTP,
        UsersController.resetPassword,
      ]);

    this.app
      .route(`${this.path}/users/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        UsersController.userExistMiddleware(),
      ])
      .patch([
        middleware({ schema: updateUserSchema, property: "body" }),
        AccessControl.checkPermissionAdminAccess(),
        UsersController.updateUser,
      ]);

    this.app
      .route(`${this.path}/users`)
      .all([Authenticate.verifyToken])
      .get([AccessControl.checkPermissionAdminAccess(), UsersController.getAllUsers]);

    return this.app;
  }
}
