import { CommonRoutesConfig } from "../common/common.routes.config";
import InterestedLawyersController from "./controllers/interestedLawyers.controllers";
import {
  markInterestSchema,
  allowedModelSchema,
  updateMarkInterestSchema,
} from "./schema/interested-lawyer.schema";

import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class InterestedLawyersRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "InterestedLawyersRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/interested-lawyers/:modelType/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: allowedModelSchema, property: "params" }),
      ])
      .post([
        middleware({ schema: markInterestSchema, property: "body" }),
        InterestedLawyersController.checkAccessLawyer(),
        InterestedLawyersController.interestExits("create"),
        wrapCatch(InterestedLawyersController.marKInterest),
      ]);

    this.app
      .route(`${this.path}/interested-lawyers/:id`)
      .all([Authenticate.verifyToken, middleware({ schema: validateUUID, property: "params" })])
      .patch([
        middleware({ schema: updateMarkInterestSchema, property: "body" }),
        InterestedLawyersController.interestExits(),
        InterestedLawyersController.checkAccessLawyer("edit"),
        wrapCatch(InterestedLawyersController.editInterest),
      ]);
  }
}
