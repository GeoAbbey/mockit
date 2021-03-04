import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import {
  createUserSchema,
  updateUserSchema,
  validateUUID,
  loginUserSchema,
} from "./schema/users.schema";
import { middleware, wrapCatch, Authenticate, AccessControl } from "../../utils";

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
        wrapCatch(UsersController.signUp),
      ]);

    this.app
      .route(`${this.path}/users/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        UsersController.userExistMiddleware,
      ])
      .patch([
        middleware({ schema: updateUserSchema, property: "body" }),
        AccessControl.checkPermissionMiddleware(),
        UsersController.updateUser,
      ]);
    return this.app;
  }
}
