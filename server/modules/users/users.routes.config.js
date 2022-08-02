import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
  validOTP,
  validOtpAndPassword,
  newOTP,
  queryOptions,
  changePasswordSchema,
  createAnAdminSchema,
  adminUpdateUser,
  validPIN,
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
      .all([Authenticate.verifyToken()])
      .patch([
        middleware({ schema: updateUserSchema, property: "body" }),
        UsersController.userExistMiddleware(),
        uploadMiddleware([
          { name: "profilePic", maxCount: 1 },
          { name: "link", maxCount: 1 },
        ]),
        wrapCatch(UsersController.updateUser),
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
      .post([wrapCatch(UsersController.generateNewOtp)]);

    this.app
      .route(`${this.path}/users/new-pin`)
      .all([UsersController.userExistMiddleware()])
      .post([wrapCatch(UsersController.generateNewPin)]);

    this.app
      .route(`${this.path}/users/verify`)
      .all([Authenticate.verifyToken("verify"), UsersController.userExistMiddleware()])
      .patch([
        middleware({ schema: validOTP, property: "body" }),
        AccessControl.checkPermissionUserOrLawyerAccess(),
        wrapCatch(UsersController.validateOTP),
        wrapCatch(UsersController.verifyEmail),
      ]);

    this.app
      .route(`${this.path}/users/verify-phone`)
      .all([Authenticate.verifyToken("verify"), UsersController.userExistMiddleware()])
      .put([
        middleware({ schema: validPIN, property: "body" }),
        AccessControl.checkPermissionUserOrLawyerAccess(),
        wrapCatch(UsersController.verifyPhoneNumber),
      ]);

    this.app
      .route(`${this.path}/users/reset-password`)
      .all([UsersController.userExistMiddleware()])
      .put([
        middleware({ schema: validOtpAndPassword, property: "body" }),
        wrapCatch(UsersController.validateOTP),
        wrapCatch(UsersController.resetPassword),
      ]);

    this.app
      .route(`${this.path}/users/change-password`)
      .all([Authenticate.verifyToken()])
      .patch([
        middleware({ schema: changePasswordSchema, property: "body" }),
        wrapCatch(UsersController.changePassword),
      ]);

    this.app
      .route(`${this.path}/users/stats`)
      .all([Authenticate.verifyToken()])
      .get([
        AccessControl.checkPermissionAdminAccess(),
        wrapCatch(UsersController.getNoOfDistinctUsers),
      ]);

    this.app
      .route(`${this.path}/users/stats/active`)
      .all([Authenticate.verifyToken()])
      .get([
        AccessControl.checkPermissionAdminAccess(),
        wrapCatch(UsersController.getNoOfActiveUsers),
      ]);

    this.app
      .route(`${this.path}/users/create`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: createAnAdminSchema, property: "body" }),
      ])
      .post([AccessControl.checkPermissionAdminAccess(), wrapCatch(UsersController.createAnAdmin)]);

    this.app
      .route(`${this.path}/users/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
      ])
      .put([
        AccessControl.checkPermissionAdminAccess(),
        UsersController.userExistMiddleware(),
        middleware({ schema: adminUpdateUser, property: "body" }),
        wrapCatch(UsersController.updateUser),
      ])
      .get([wrapCatch(UsersController.getUser)]);

    this.app
      .route(`${this.path}/users`)
      .all([Authenticate.verifyToken()])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        AccessControl.checkPermissionAdminAccess(),
        wrapCatch(UsersController.queryContext),
        wrapCatch(UsersController.getAllUsers),
      ]);

    return this.app;
  }
}
