import { CommonRoutesConfig } from "../common/common.routes.config";
import InvitationsController from "./controllers/invitations.controller";
import { createInvitationSchema } from "./schema/invitation.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class InvitationRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "InvitationRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/invitations`)
      .post([
        Authenticate.verifyToken,
        middleware({ schema: createInvitationSchema, property: "body" }),
        wrapCatch(InvitationsController.makeInvite),
      ]);
  }
}
