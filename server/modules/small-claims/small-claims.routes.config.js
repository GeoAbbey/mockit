import { CommonRoutesConfig } from "../common/common.routes.config";
import SmallClaimsController from "./controllers/small-claims.controller";
import { createSmallClaimSchema, updateSmallClaimSchema } from "./schema/small-claim.schema";
import { wrapCatch, middleware, Authenticate, validateUUID, uploadMiddleware } from "../../utils";

export class SmallClaimRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "SmallClaimRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/small-claims`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: createSmallClaimSchema, property: "body" }),
        [uploadMiddleware, wrapCatch(SmallClaimsController.makeClaim)],
      ])
      .get([
        SmallClaimsController.queryContext,
        wrapCatch(SmallClaimsController.getAllSmallClaims),
      ]);

    this.app
      .route(`${this.path}/small-claims/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        SmallClaimsController.smallClaimExits,
      ])
      .delete([
        SmallClaimsController.checkAccessUser("delete"),
        wrapCatch(SmallClaimsController.deleteClaim),
      ])
      .get([
        SmallClaimsController.checkAccessUser("retrieve"),
        wrapCatch(SmallClaimsController.getASmallClaim),
      ])
      .patch([
        middleware({ schema: updateSmallClaimSchema, property: "body" }),
        SmallClaimsController.checkAccessUser("modify"),
        wrapCatch(SmallClaimsController.modifyClaim),
      ])
      .put([
        SmallClaimsController.checkAccessLawyer("markAsComplete"),
        wrapCatch(SmallClaimsController.marKAsCompleted),
      ]);
  }
}
