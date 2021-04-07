import { CommonRoutesConfig } from "../common/common.routes.config";
import SmallClaimsController from "./controllers/small-claims.controller";
import {
  createSmallClaimSchema,
  updateSmallClaimSchema,
  markInterestSchema,
} from "./schema/small-claim.schema";
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
        SmallClaimsController.smallClaimExits(),
      ])
      .delete([
        SmallClaimsController.checkAccessUser("delete"),
        wrapCatch(SmallClaimsController.deleteClaim),
      ])
      .patch([
        middleware({ schema: updateSmallClaimSchema, property: "body" }),
        SmallClaimsController.checkAccessUser("modify"),
        wrapCatch(SmallClaimsController.modifyClaim),
      ])
      .head([
        SmallClaimsController.checkAccessLawyer("markAsComplete"),
        wrapCatch(SmallClaimsController.marKAsCompleted),
      ])
      .post([
        middleware({ schema: markInterestSchema, property: "body" }),
        SmallClaimsController.checkAccessLawyer("markInterest"),
        wrapCatch(SmallClaimsController.marKInterest),
      ])
      .put([
        SmallClaimsController.checkAccessUser("assignLawyer"),
        wrapCatch(SmallClaimsController.assignALawyer),
      ]);

    this.app
      .route(`${this.path}/small-claims/:id`)
      .get([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        SmallClaimsController.smallClaimExits("retrieve"),
        SmallClaimsController.checkAccessUser("retrieve"),
        wrapCatch(SmallClaimsController.getASmallClaim),
      ]);
  }
}
