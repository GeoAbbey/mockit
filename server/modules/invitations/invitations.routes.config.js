import { CommonRoutesConfig } from "../common/common.routes.config";
import InvitationsController from "./controllers/invitations.controller";
import {
  createInvitationSchema,
  updatedInvitationSchema,
  queryOptions,
} from "./schema/invitation.schema";
import { wrapCatch, middleware, Authenticate, validateUUID, uploadMiddleware } from "../../utils";
import { queryContextParams } from "../../utils/allPurpose.schema";

export class InvitationRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "InvitationRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/invitations`)
      .all([Authenticate.verifyToken()])
      .post([
        uploadMiddleware(),
        // middleware({ schema: createInvitationSchema, property: "body" }),
        wrapCatch(InvitationsController.makeInvite),
      ])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        InvitationsController.queryContext,
        wrapCatch(InvitationsController.getAllInvitations),
      ]);

    this.app
      .route(`${this.path}/invitation/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        wrapCatch(InvitationsController.invitationExits()),
      ])
      .patch([
        middleware({ schema: updatedInvitationSchema, property: "body" }),
        InvitationsController.checkAccessUser("modify"),
        wrapCatch(InvitationsController.modifyInvite),
      ])
      .put([
        InvitationsController.checkAccessLawyer("bid"),
        wrapCatch(InvitationsController.modifyInvite),
      ])
      .post([
        InvitationsController.checkAccessLawyer("markAsComplete"),
        wrapCatch(InvitationsController.marKAsCompleted),
      ])
      .delete([
        InvitationsController.checkAccessUser("delete"),
        wrapCatch(InvitationsController.deleteInvite),
      ]);

    this.app
      .route(`${this.path}/invitation/:id`)
      .get([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        InvitationsController.invitationExits("retrieve"),
        InvitationsController.checkAccessUser("retrieve"),
        wrapCatch(InvitationsController.getAnInvite),
      ]);

    this.app
      .route(`${this.path}/invitations/unassigned`)
      .get([
        Authenticate.verifyToken(),
        InvitationsController.checkAccessLawyer(),
        wrapCatch(InvitationsController.getUnAssignedInvites),
      ]);

    this.app
      .route(`${this.path}/invitations/assign-lawyer/:id`)
      .put([
        Authenticate.verifyToken(),
        InvitationsController.checkAccessAdmin(),
        wrapCatch(InvitationsController.invitationExits()),
        wrapCatch(InvitationsController.adminAssignLawyer),
      ]);

    this.app
      .route(`${this.path}/invitations/stats`)
      .get([
        Authenticate.verifyToken(),
        InvitationsController.checkAccessAdmin(),
        wrapCatch(InvitationsController.getStats),
      ]);
  }
}
