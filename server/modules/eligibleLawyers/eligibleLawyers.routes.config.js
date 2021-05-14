import { CommonRoutesConfig } from "../common/common.routes.config";
import EligibleLawyersController from "./controllers/eligibleLawyers.controllers";
import {
  createEligibleLawyerSchema,
  filterEligibleLawyerSchema,
} from "./schema/EligibleLawyers.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class EligibleLawyerRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "EligibleLawyerRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/eligible-lawyer`)
      .all([Authenticate.verifyToken, EligibleLawyersController.checkAccessAdmin()])
      .post([
        middleware({ schema: createEligibleLawyerSchema, property: "body" }),
        wrapCatch(EligibleLawyersController.makeEligibleLawyer),
      ])
      .get([
        middleware({ schema: filterEligibleLawyerSchema, property: "query" }),
        EligibleLawyersController.queryContext,
        wrapCatch(EligibleLawyersController.getAllEligibleLawyers),
      ]);

    this.app
      .route(`${this.path}/eligible-lawyer/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        EligibleLawyersController.checkAccessAdmin(),
      ])
      .delete([
        EligibleLawyersController.eligibleLawyerExits(),
        wrapCatch(EligibleLawyersController.deleteEligibleLawyer),
      ]);

    return this.app;
  }
}
