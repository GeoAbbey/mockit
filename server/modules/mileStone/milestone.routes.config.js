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
      .all([Authenticate.verifyToken()])
      .post([
        wrapCatch(MileStonesController.checkAccessLawyer()),
        middleware({ schema: createMileStoneSchema, property: "body" }),
        wrapCatch(MileStonesController.mileStoneExits("create")),
        wrapCatch(MileStonesController.makeMileStones),
      ])
      .get([
        wrapCatch(MileStonesController.queryContext),
        wrapCatch(MileStonesController.getAllMileStones),
      ]);

    this.app
      .route(`${this.path}/milestones/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
      ])
      .put([
        middleware({ schema: modifyMileStoneSchema, property: "body" }),
        wrapCatch(MileStonesController.mileStoneExits()),
        wrapCatch(MileStonesController.checkAccessLawyer("modify")),
        wrapCatch(MileStonesController.modifyMileStone),
      ])
      .get([
        wrapCatch(MileStonesController.mileStoneExits()),
        wrapCatch(MileStonesController.checkAccessLawyer("modify")),
        wrapCatch(MileStonesController.getMileStone),
      ]);

    return this.app;
  }
}
