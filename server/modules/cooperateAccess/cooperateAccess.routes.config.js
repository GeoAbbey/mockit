import { CommonRoutesConfig } from "../common/common.routes.config";
import CooperateAccessController from "./controllers/cooperate-access.controllers";

import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";
import { EmailAccess, queryOptions } from "./schema/cooperate.schema";

export class CooperateAccessRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "CooperateAccessRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/cooperate-access`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: EmailAccess, property: "body" }),
        wrapCatch(CooperateAccessController.grantCooperateAccess),
      ])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(CooperateAccessController.queryContext),
        wrapCatch(CooperateAccessController.allUsersWithAccess),
      ]);

    this.app
      .route(`${this.path}/cooperate-access/:id`)
      .all([Authenticate.verifyToken()])
      .delete([
        middleware({ schema: validateUUID("id"), property: "params" }),
        wrapCatch(CooperateAccessController.cooperateAccessExists),
        wrapCatch(CooperateAccessController.deleteCooperateAccess),
      ]);

    return this.app;
  }
}
