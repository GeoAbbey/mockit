import debug from "debug";
import createError from "http-errors";

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
    const { body } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new invitation for user with id ${ownerId}`);
    const invitation = await InvitationsService.create({ ...body, ownerId });

    return res.status(201).send({
      success: true,
      message: "invitation successfully created",
      invitation,
    });
  }

  async invitationExits(req, res, next) {
    const { id } = req.params;
    log(`verifying that an invitation with id ${id} exits`);
    const invitation = await InvitationsService.find(id);
    if (!invitation) return next(createError(404, "The invitation can not be found"));
    req.oldInvitation = invitation;
    next();
  }

  async modifyInvite(req, res, next) {
    const {
      body,
      oldInvitation,
      params: { id },
    } = req;
    if (oldInvitation.bid) {
      (body.assignedLawyerId = req.decodedToken.id), (body.status = "in-progress");
    }
    const [, [updatedInvitation]] = await InvitationsService.update(id, body, oldInvitation);
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
      message: "Invitation succesfully retrieved",
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
    const {
      body,
      params: { id },
      oldInvitation,
    } = req;

    const [, [updatedInvitation]] = await InvitationsService.update(id, body, oldInvitation);
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
        return next(createError(401, `You do not have access to  ${context} this invitation`));
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
        body,
      } = req;
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (body.reason || body.venue || body.attachments)
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "markAsComplete") {
        if (id !== oldInvitation.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
      }
      req.oldInvitation.bid = true;
      next();
    };
  }

  queryContext(req, res, next) {
    const { role, id } = req.decodedToken;
    if (role === "admin" || role === "super-admin") {
      req.data = {};
    }
    if (role === "lawyer") {
      req.data = { where: { assignedLawyerId: id } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    next();
  }
}

export default InvitationsController.getInstance();
