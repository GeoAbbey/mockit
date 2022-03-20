import { CommonRoutesConfig } from "../common/common.routes.config";
import DashboardsController from "./controllers/dashboard.controllers";
import { dateOptions, queryOptions } from "./schema/dashboard.schema";

import { wrapCatch, middleware, Authenticate } from "../../utils";

export class DashboardRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "DashboardRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/dashboard/histogram`)
      .all([Authenticate.verifyToken(), wrapCatch(DashboardsController.checkAccessAdmin())])
      .get([wrapCatch(DashboardsController.getHistogram)]);

    this.app
      .route(`${this.path}/dashboard/fulfilled`)
      .get([
        Authenticate.verifyToken(),
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(DashboardsController.getFulfilled),
      ]);

    this.app
      .route(`${this.path}/dashboard/cashInAndOut`)
      .all([Authenticate.verifyToken(), wrapCatch(DashboardsController.checkAccessAdmin())])
      .get([
        middleware({ schema: dateOptions, property: "query" }),
        wrapCatch(DashboardsController.dateOptions),
        wrapCatch(DashboardsController.cashInAndOut),
      ]);

    return this.app;
  }
}
