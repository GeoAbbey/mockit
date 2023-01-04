import { CommonRoutesConfig } from "../common/common.routes.config";
import PayInController from "./controllers/pay-in.controllers";
import { queryOptions } from "./schema/pay-in.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class PayInRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "PayInRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/pay-ins`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: queryOptions, property: "query" }),
        PayInController.checkAccessAdmin(),
      ])
      .get([wrapCatch(PayInController.queryContext), wrapCatch(PayInController.getAllPayIns)]);

    return this.app;
  }
}
