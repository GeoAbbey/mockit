import { CommonRoutesConfig } from "../common/common.routes.config";
import SmallClaimsController from "./controllers/small-claims.controller";
import {
  createSmallClaimSchema,
  updateSmallClaimSchema,
  lawyerUpdateClaimSchema,
  queryOptions,
} from "./schema/small-claim.schema";
import { wrapCatch, middleware, Authenticate, validateUUID, uploadMiddleware } from "../../utils";

export class SmallClaimRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "SmallClaimRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/small-claims`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: createSmallClaimSchema, property: "body" }),
        [uploadMiddleware(), wrapCatch(SmallClaimsController.makeClaim)],
      ])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        SmallClaimsController.queryContext,
        wrapCatch(SmallClaimsController.getAllSmallClaims),
      ]);

    this.app
      .route(`${this.path}/small-claims/unassigned`)
      .get([
        Authenticate.verifyToken(),
        SmallClaimsController.checkAccessLawyer(),
        wrapCatch(SmallClaimsController.getUnassignedClaims),
      ]);

    this.app
      .route(`${this.path}/small-claims/stats`)
      .get([
        Authenticate.verifyToken(),
        SmallClaimsController.checkAccessAdmin(),
        wrapCatch(SmallClaimsController.getStats),
      ]);

    this.app
      .route(`${this.path}/small-claims/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
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
      ]);

    this.app
      .route(`${this.path}/small-claims/modify/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        SmallClaimsController.smallClaimExits(),
      ])
      .put([
        middleware({ schema: lawyerUpdateClaimSchema, property: "body" }),
        SmallClaimsController.checkAccessLawyer("updateStatus"),
        wrapCatch(SmallClaimsController.updateToNewState),
      ]);

    this.app
      .route(`${this.path}/small-claims/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        SmallClaimsController.smallClaimExits("retrieve"),
      ])
      .get([
        SmallClaimsController.checkAccessUser("retrieve"),
        wrapCatch(SmallClaimsController.getASmallClaim),
      ]);

    return this.app;
  }
}
