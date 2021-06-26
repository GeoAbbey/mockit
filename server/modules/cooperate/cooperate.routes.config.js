import { CommonRoutesConfig } from "../common/common.routes.config";
import CooperatesController from "./controller/cooperate.controllers";
import { createCooperateSchema, editCooperateSchema } from "./schema/cooperate.schema";

import { wrapCatch, middleware, Authenticate } from "../../utils";

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
      ])
      .patch([
        middleware({ schema: editCooperateSchema, property: "body" }),
        wrapCatch(CooperatesController.cooperateExists()),
        wrapCatch(CooperatesController.editCooperate),
      ])
      .get([
        middleware({ schema: editCooperateSchema, property: "body" }),
        wrapCatch(CooperatesController.cooperateExists("retrieve")),
      ]);

    this.app
      .route(`${this.path}/cooperate/usage`)
      .all([Authenticate.verifyToken])
      .get([
        wrapCatch(CooperatesController.cooperateExists()),
        wrapCatch(CooperatesController.usageHistory),
      ]);

    return this.app;
  }
}
