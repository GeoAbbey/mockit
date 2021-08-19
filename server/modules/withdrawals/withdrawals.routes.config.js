import { CommonRoutesConfig } from "../common/common.routes.config";
import WithdrawalsController from "./controller/withdrawals.controllers";
import { createWithdrawalSchema } from "./schema/withdrawals.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class WithdrawalRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "WithdrawalRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/withdrawal`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: createWithdrawalSchema, property: "body" }),
        wrapCatch(WithdrawalsController.makeWithdrawal),
      ])
      .get([wrapCatch(WithdrawalsController.WithdrawalExist("retrieve"))]);

    this.app
      .route(`${this.path}/withdrawals/:id`)
      .all([Authenticate.verifyToken(), WithdrawalsController.checkAccessLawyer()])
      .get([wrapCatch(WithdrawalsController.getAWithdrawal)]);

    return this.app;
  }
}
