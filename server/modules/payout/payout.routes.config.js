import { CommonRoutesConfig } from "../common/common.routes.config";
import PayoutsController from "./controllers/payout.controller";
import { createPayoutSchema, recipientCodeSchema, queryOptions } from "./schema/payout.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class PayoutRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "PayoutRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/payout/:code`)
      .all([
        middleware({ schema: recipientCodeSchema, property: "params" }),
        Authenticate.verifyToken,
      ])
      .post([
        PayoutsController.checkAccessAdmin(),
        middleware({ schema: createPayoutSchema, property: "body" }),
        wrapCatch(PayoutsController.createPayout),
      ]);

    this.app
      .route(`${this.path}/payout/getHistory`)
      .all([Authenticate.verifyToken])
      .get([
        PayoutsController.checkAccessLawyer(),
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(PayoutsController.getHistory),
      ]);

    return this.app;
  }
}
