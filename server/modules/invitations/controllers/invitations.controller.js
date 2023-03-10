import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import InvitationsService from "../service/invitations.service";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

const log = debug("app:invitations-controller");
class InvitationsController {
  static instance;
  static getInstance() {
    if (!InvitationsController.instance) {
      InvitationsController.instance = new InvitationsController();
    }
    return InvitationsController.instance;
  }

  async adminAssignLawyer(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const {
      params: { id },
      decodedToken,
      body: { lawyerId },
      oldInvitation,
    } = req;

    if (!oldInvitation.paid)
      return next(
        createError(400, "You can't assign a lawyer to an invitation that hasn't been paid for")
      );

    const [, [updatedInvitation]] = await InvitationsService.update(
      id,
      { isNotified: true, assignedLawyerId: lawyerId },
      oldInvitation
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.ADMIN_ASSIGN_LAWYER, {
      invitation: updatedInvitation,
      decodedToken,
    });

    return res.status(200).send({
      success: true,
      message: "lawyer has been successfully assigned",
      invitation: updatedInvitation,
    });
  }

  async makeInvite(req, res) {
    const { body, attachments = [] } = req;
    const ownerId = req.decodedToken.id;

    log(`creating a new invitation for user with id ${ownerId}`);
    body.venue = JSON.parse(body.venue);
    const invitation = await InvitationsService.create({ attachments, ...body, ownerId });

    return res.status(201).send({
      success: true,
      message: "Police invitation successfully created",
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
      return next();
    };
  }

  async modifyInvite(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const io = req.app.get("io");

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
        decodedToken,
        io,
      });

    return res.status(200).send({
      success: true,
      message: !oldInvitation.bid
        ? "invitation successfully updated"
        : "This request has been assigned to you",
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

  async getUnAssignedInvites(req, res, next) {
    log("getting all unassigned invitations");
    const {
      query: { paginate = {} },
      decodedToken: {
        id,
        address: { country, state },
      },
    } = req;

    const data = {
      assignedLawyerId: null,
      status: "initiated",
      paid: true,
      venue: { country, state },
    };

    const invitations = await InvitationsService.findMany(data, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "unassigned invitations successfully retrieved",
      invitations: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...invitations,
      },
    });
  }

  async getStats(req, res, next) {
    log("getting statistics for invitations");

    const allStats = await InvitationsService.stats();
    return res.status(200).send({
      success: true,
      message: "small claims statistics successfully retrieved",
      allStats,
    });
  }

  async getAllInvitations(req, res, next) {
    log("getting all invitations");
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const invitations = await InvitationsService.findMany(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "invitations successfully retrieved",
      invitations: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...invitations,
      },
    });
  }

  async updateStatus(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const io = req.app.get("io");

    const statusMapper = {
      completed: { status: "completed" },
      cancel: { status: "initiated", assignedLawyerId: null },
    };

    const eventMapper = {
      completed: "INVITATION_MARK_AS_COMPLETED",
      cancel: "INVITATION_CANCELLED",
    };

    const {
      params: { id },
      body: { status },
      decodedToken,
      oldInvitation,
    } = req;

    const [, [updatedInvitation]] = await InvitationsService.update(
      id,
      statusMapper[status],
      oldInvitation
    );

    eventEmitter.emit(eventMapper[status], {
      invitation: updatedInvitation,
      decodedToken,
      io,
    });

    return res.status(200).send({
      success: true,
      message: `You have successfully ${status} this invitation`,
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
      if (role === "admin" || role === "super-admin") return next();
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
      return next();
    };
  }

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(401, "You do not have permission to access this route"));
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldInvitation,
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "updateStatus") {
        if (oldInvitation.status === "completed")
          return next(createError(401, "This invitation is already completed"));
        if (oldInvitation.status === "initiated" && req.body.status === "cancel")
          return next(createError(401, "This invitation has been successfully cancelled"));
        if (id !== oldInvitation.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
      }

      if (context === "bid") {
        if (oldInvitation.assignedLawyerId)
          return next(
            createError(401, "This invitation has already been assigned to another lawyer")
          );
        if (!oldInvitation.paid) return next(createError(401, "Invitation hasn't been  paid for"));
        req.oldInvitation.bid = true;
      }
      return next();
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    const commonOptions = () => {
      if (query.search && query.search.ticketId) {
        filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
      }

      if (query.search && query.search.paid) {
        filter = { ...filter, paid: query.search.paid };
      }

      if (query.search && query.search.status) {
        filter = { ...filter, status: query.search.status };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }

      commonOptions();

      if (query.search && query.search.assignedLawyerId) {
        filter = { ...filter, assignedLawyerId: query.search.assignedLawyerId };
      }
    }

    if (role === "lawyer") {
      filter = { ...filter, assignedLawyerId: id };

      commonOptions();
    }

    if (role === "user") {
      filter = { ...filter, ownerId: id };

      commonOptions();
    }

    req.filter = filter;
    return next();
  }
}

export default InvitationsController.getInstance();
