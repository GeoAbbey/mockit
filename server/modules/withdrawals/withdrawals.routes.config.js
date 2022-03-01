import { CommonRoutesConfig } from "../common/common.routes.config";
import WithdrawalsController from "./controller/withdrawals.controllers";
import {
  createWithdrawalSchema,
  queryOptions,
  finalizeOTP,
  accountWithdrawalSchema,
  referenceSchema,
} from "./schema/withdrawals.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";
import { paymentAuthMiddleware } from "../payment/controllers/paymentAuth";

export class WithdrawalRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "WithdrawalRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/withdrawals/:accountCode`)
      .all([
        middleware({ schema: accountWithdrawalSchema, property: "params" }),
        Authenticate.verifyToken(),
      ])
      .post([
        middleware({ schema: createWithdrawalSchema, property: "body" }),
        wrapCatch(WithdrawalsController.makeWithdrawal),
      ]);

    this.app
      .route(`${this.path}/withdrawals`)
      .all([middleware({ schema: queryOptions, property: "query" }), Authenticate.verifyToken()])
      .get([
        WithdrawalsController.checkAccessUser("retrieve"),
        wrapCatch(WithdrawalsController.queryContext),
        wrapCatch(WithdrawalsController.getAllWithdrawals),
      ]);

    this.app
      .route(`${this.path}/withdrawals/:id`)
      .all([
        middleware({ schema: validateUUID("id"), property: "params" }),
        Authenticate.verifyToken(),
        WithdrawalsController.checkAccessLawyer(),
        wrapCatch(WithdrawalsController.withdrawalExist("retrieve")),
      ])
      .get([
        wrapCatch(WithdrawalsController.checkAccessUser("retrieve")),
        wrapCatch(WithdrawalsController.getAWithdrawal),
      ])
      .delete([
        wrapCatch(WithdrawalsController.checkAccessUser("delete")),
        wrapCatch(WithdrawalsController.softDeleteAWithdrawal),
      ]);

    this.app
      .route(`${this.path}/withdrawal/:id`)
      .post([
        middleware({ schema: validateUUID("id"), property: "params" }),
        Authenticate.verifyToken(),
        wrapCatch(WithdrawalsController.checkAccessAdmin()),
        wrapCatch(WithdrawalsController.withdrawalExist("finalize")),
        wrapCatch(paymentAuthMiddleware()),
        wrapCatch(WithdrawalsController.authorizeAWithdrawal),
      ]);

    return this.app;
  }
}
