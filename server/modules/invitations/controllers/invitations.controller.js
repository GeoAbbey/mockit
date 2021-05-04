import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import InvitationsService from "../service/invitations.service";
const log = debug("app:invitations-controller");

class InvitationsController {
  static instance;
  static getInstance() {
    if (!InvitationsController.instance) {
      InvitationsController.instance = new InvitationsController();
    }
    return InvitationsController.instance;
  }

  async makeInvite(req, res) {
    const eventEmitter = req.app.get("eventEmitter");

    const { body, attachments = [] } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new invitation for user with id ${ownerId}`);
    const invitation = await InvitationsService.create({ attachments, ...body, ownerId });

    eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.CREATED, invitation);
    return res.status(201).send({
      success: true,
      message: "invitation successfully created",
      invitation,
    });
  }

  invitationExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that an invitation with id ${id} exits`);
      const invitation = await InvitationsService.find(id, context);
      if (!invitation) return next(createError(404, "The invitation can not be found"));
      req.oldInvitation = invitation;
      next();
    };
  }

  async modifyInvite(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body,
      oldInvitation,
      decodedToken,
      params: { id },
    } = req;
    if (oldInvitation.bid) {
      (body.assignedLawyerId = req.decodedToken.id), (body.status = "in-progress");
    }
    const [, [updatedInvitation]] = await InvitationsService.update(id, body, oldInvitation);

    if (oldInvitation.bid)
      eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.ASSIGNED, {
        invitation: updatedInvitation,
      });

    return res.status(200).send({
      success: true,
      message: !oldInvitation.bid
        ? "invitation successfully updated"
        : "You have been assigned this invitation",
      invitation: updatedInvitation,
    });
  }

  async deleteInvite(req, res, next) {
    const { id } = req.params;
    log(`deleting an invitation with id ${id}`);
    const deletedInvitation = await InvitationsService.remove(id);
    return res.status(200).send({
      success: true,
      message: "invitation successfully deleted",
      invitation: deletedInvitation,
    });
  }

  getAnInvite(req, res, next) {
    const { oldInvitation } = req;
    return res.status(200).send({
      success: true,
      message: "Invitation successfully retrieved",
      invitation: oldInvitation,
    });
  }

  async getAllInvitations(req, res, next) {
    log("getting all invitations");
    const { data } = req;
    const invitations = await InvitationsService.findMany(data);
    return res.status(200).send({
      success: true,
      message: "invitations successfully retrieved",
      invitations,
    });
  }

  async marKAsCompleted(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      oldInvitation,
    } = req;

    const [, [updatedInvitation]] = await InvitationsService.update(
      id,
      { status: "completed" },
      oldInvitation
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED, {
      invitation: updatedInvitation,
    });

    return res.status(200).send({
      success: true,
      message: "You have successfully completed this invitation",
      invitation: updatedInvitation,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        body,
        oldInvitation: { ownerId, status },
      } = req;
      if (role === "admin" || role === "super-admin") next();
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this invitation`));
      }
      if (role === "user" && id === ownerId && body.assignedLawyerId)
        return next(createError(403, "you can't assign a lawyer to yourself"));
      if (context !== "retrieve") {
        if (role === "user" && status !== "initiated")
          return next(
            createError(401, `You can't ${context} an invitation once it has been assigned`)
          );
      }
      next();
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldInvitation,
      } = req;
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "markAsComplete") {
        if (id !== oldInvitation.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
      }

      if (context === "bid") {
        if (oldInvitation.assignedLawyerId)
          return next(
            createError(401, "This invitation has already been assigned to another lawyer")
          );
      }
      req.oldInvitation.bid = true;
      next();
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;
    console.log({ query });
    if (role === "admin" || role === "super-admin") {
      req.data = {};
      if (query) {
        req.data.where = {
          ...query,
        };
      }
    }
    if (role === "lawyer") {
      req.data = { where: { assignedLawyerId: id } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    return next();
  }
}

export default InvitationsController.getInstance();
