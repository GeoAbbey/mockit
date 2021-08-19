import { CommonRoutesConfig } from "../common/common.routes.config";
import AuthCodesController from "./controllers/auth-code.controllers";
import { queryOptions } from "./schema/auth-codes.schema";

import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class AuthCodeRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "AuthCodeRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/auth-codes/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
      ])
      .delete([
        wrapCatch(AuthCodesController.authCodeExists),
        wrapCatch(AuthCodesController.checkAccessUser()),
        wrapCatch(AuthCodesController.deleteAuthCode),
      ]);

    this.app
      .route(`${this.path}/auth-codes`)
      .get([
        Authenticate.verifyToken(),
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(AuthCodesController.getAuthCodes),
      ]);

    return this.app;
  }
}
