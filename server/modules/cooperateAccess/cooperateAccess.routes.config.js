import { CommonRoutesConfig } from "../common/common.routes.config";
import CooperateAccessController from "./controllers/cooperate-access.controllers";

import { wrapCatch, middleware, Authenticate } from "../../utils";
import { CooperateAccessIds } from "./schema/cooperate.schema";

export class CooperateAccessRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "CooperateAccessRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/cooperate-access`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: CooperateAccessIds("userIds"), property: "body" }),
        wrapCatch(CooperateAccessController.grantCooperateAccess),
      ]);

    this.app
      .route(`${this.path}/cooperate-access/:id`)
      .all([Authenticate.verifyToken])
      .delete([
        wrapCatch(CooperateAccessController.cooperateAccessExists),
        wrapCatch(CooperateAccessController.deleteCooperateAccess),
      ]);

    return this.app;
  }
}
