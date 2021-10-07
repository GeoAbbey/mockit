import { CommonRoutesConfig } from "../common/common.routes.config";
import PayoutAndWithdrawalController from "./controllers/payoutAndWithdrawals.controllers";
import { queryOptions } from "./schema/payoutAndWithdrawals.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class PayoutsAndWithdrawalRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "PayoutsAndWithdrawalRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/payoutsAndWithdrawals`)
      .all([Authenticate.verifyToken()])
      .get([
        PayoutAndWithdrawalController.checkAccessLawyer(),
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(PayoutAndWithdrawalController.getHistory),
      ]);

    return this.app;
  }
}
