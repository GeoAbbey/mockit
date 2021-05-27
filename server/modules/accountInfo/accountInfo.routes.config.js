import { CommonRoutesConfig } from "../common/common.routes.config";
import AccountInfosController from "./controllers/accountInfo.controllers";
import { AccountInfoSchema, AccountParamsSchema } from "./schema/accountInfo.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class AccountInfoRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "AccountInfoRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/accountInfo/:ownerId`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID("ownerId"), property: "params" }),
      ])
      .post([
        AccountInfosController.checkAccessAdmin(),
        wrapCatch(AccountInfosController.createAccountInfo),
      ])
      .get([
        AccountInfosController.accountInfoExits(),
        AccountInfosController.checkAccessUser("retrieve"),
        wrapCatch(AccountInfosController.getAccountInfoBalance),
      ]);

    this.app
      .route(`${this.path}/accountInfo/:info/:ownerId`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: AccountParamsSchema, property: "params" }),
        AccountInfosController.checkAccessAdmin(),
        AccountInfosController.accountInfoExits(),
      ])
      .post([
        middleware({ schema: AccountInfoSchema, property: "body" }),
        wrapCatch(AccountInfosController.accountInfoOperation("add")),
      ])
      .put([
        middleware({ schema: AccountInfoSchema, property: "body" }),
        wrapCatch(AccountInfosController.accountInfoOperation("deduct")),
      ]);

    return this.app;
  }
}
