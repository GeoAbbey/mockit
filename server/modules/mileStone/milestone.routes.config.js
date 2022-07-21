import { CommonRoutesConfig } from "../common/common.routes.config";
import MileStonesController from "./controllers/milestone.controllers";
import { createMileStoneSchema, modifyMileStoneSchema } from "./schema/milestone.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class MileStoneRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "MileStoneRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/milestones`)
      .all([Authenticate.verifyToken(), wrapCatch(MileStonesController.checkAccessLawyer())])
      .post([
        middleware({ schema: createMileStoneSchema, property: "body" }),
        wrapCatch(MileStonesController.makeMileStones),
      ]);

    this.app
      .route(`${this.path}/milestones/:id`)
      .all([Authenticate.verifyToken(), wrapCatch(MileStonesController.checkAccessLawyer())])
      .put([
        middleware({ schema: validateUUID("id"), property: "params" }),
        middleware({ schema: modifyMileStoneSchema, property: "body" }),
        wrapCatch(MileStonesController.mileStoneExits()),
        wrapCatch(MileStonesController.checkAccessLawyer("modify")),
        wrapCatch(MileStonesController.modifyMileStone),
      ]);

    return this.app;
  }
}
