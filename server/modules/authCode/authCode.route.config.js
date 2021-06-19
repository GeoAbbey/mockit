import { CommonRoutesConfig } from "../common/common.routes.config";
import AuthCodesController from "./controllers/auth-code.controllers";

import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class AuthCodeRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "AuthCodeRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/authCodes/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID("id"), property: "params" }),
      ])
      .delete([
        wrapCatch(AuthCodesController.authCodeExists),
        wrapCatch(AuthCodesController.deleteAuthCode),
      ]);

    return this.app;
  }
}
