import { CommonRoutesConfig } from "../common/common.routes.config";
import CooperatesController from "./controller/cooperate.controllers";
import { createCooperateSchema } from "./schema/cooperate.schema";

import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class CooperateRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "CooperateRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/cooperate`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: createCooperateSchema, property: "body" }),
        wrapCatch(CooperatesController.createCooperate),
      ]);

    return this.app;
  }
}
