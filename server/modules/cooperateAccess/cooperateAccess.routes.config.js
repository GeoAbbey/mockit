import { CommonRoutesConfig } from "../common/common.routes.config";
import CooperateAccessController from "./controllers/cooperate-access.controllers";

import { wrapCatch, middleware, Authenticate } from "../../utils";
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
      .delete([
        middleware({ schema: EmailAccess, property: "body" }),
        wrapCatch(CooperateAccessController.cooperateAccessExists),
        wrapCatch(CooperateAccessController.deleteCooperateAccess),
      ])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(CooperateAccessController.queryContext),
        wrapCatch(CooperateAccessController.allUsersWithAccess),
      ]);

    return this.app;
  }
}
