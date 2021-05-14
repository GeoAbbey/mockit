import { CommonRoutesConfig } from "../common/common.routes.config";
import LocationDetailsController from "./controllers/locationDetails.controller";
import { visibilitySchema } from "./schema/locationDetails.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class LocationDetailRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "LocationDetailRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/location/visibility/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        wrapCatch(LocationDetailsController.locationDetailExits()),
      ])
      .put([
        middleware({ schema: visibilitySchema, property: "body" }),
        LocationDetailsController.checkAccessLawyerAccess("modify"),
        wrapCatch(LocationDetailsController.toggleVisibility),
      ])
      .get([
        LocationDetailsController.checkAccessLawyerAccess("retrieve"),
        wrapCatch(LocationDetailsController.getLocationDetail),
      ]);

    return this.app;
  }
}
