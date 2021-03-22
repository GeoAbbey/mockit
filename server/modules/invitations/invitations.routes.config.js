import { CommonRoutesConfig } from "../common/common.routes.config";
import InvitationsController from "./controllers/invitations.controller";
import {
  createInvitationSchema,
  updatedInvitationSchema,
  markAsCompletedSchema,
} from "./schema/invitation.schema";
import { wrapCatch, middleware, Authenticate, validateUUID, uploadMiddleware } from "../../utils";

export class InvitationRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "InvitationRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/invitations`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: createInvitationSchema, property: "body" }),
        [uploadMiddleware, wrapCatch(InvitationsController.makeInvite)],
      ])
      .get([
        InvitationsController.queryContext,
        wrapCatch(InvitationsController.getAllInvitations),
      ]);

    this.app
      .route(`${this.path}/invitations/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        InvitationsController.invitationExits,
      ])
      .patch([
        middleware({ schema: updatedInvitationSchema, property: "body" }),
        InvitationsController.checkAccessUser("modify"),
        wrapCatch(InvitationsController.modifyInvite),
      ])
      .put([
        InvitationsController.checkAccessLawyer(),
        wrapCatch(InvitationsController.modifyInvite),
      ])
      .post([
        middleware({ schema: markAsCompletedSchema, property: "body" }),
        InvitationsController.checkAccessLawyer("markAsComplete"),
        wrapCatch(InvitationsController.marKAsCompleted),
      ])
      .delete([
        InvitationsController.checkAccessUser("delete"),
        wrapCatch(InvitationsController.deleteInvite),
      ])
      .get([
        InvitationsController.invitationExits,
        InvitationsController.checkAccessUser("retrieve"),
        wrapCatch(InvitationsController.getAnInvite),
      ]);
  }
}
