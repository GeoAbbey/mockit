import { CommonRoutesConfig } from "../common/common.routes.config";
import LocationDetailsController from "./controllers/locationDetails.controller";
import { visibilitySchema } from "./schema/locationDetails.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class LocationDetailRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "LocationDetailRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/location/visibility`)
      .all([Authenticate.verifyToken(), wrapCatch(LocationDetailsController.locationDetailExits())])
      .put([
        middleware({ schema: visibilitySchema, property: "body" }),
        wrapCatch(LocationDetailsController.toggleVisibility),
      ])
      .get([
        LocationDetailsController.checkAccessLawyerAccess("retrieve"),
        wrapCatch(LocationDetailsController.getLocationDetail),
      ]);

    return this.app;
  }
}
