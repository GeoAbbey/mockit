import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import SmallClaimsService from "../services/small-claims.service";
import { paginate as pagination } from "../../helpers";
const log = debug("app:small-claims-controller");

class SmallClaimsController {
  static instance;
  static getInstance() {
    if (!SmallClaimsController.instance) {
      SmallClaimsController.instance = new SmallClaimsController();
    }
    return SmallClaimsController.instance;
  }

  async makeClaim(req, res) {
    const eventEmitter = req.app.get("eventEmitter");

    const { body, decodedToken, attachments = [] } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new small claim for user with id ${ownerId}`);
    const smallClaim = await SmallClaimsService.create({ ...body, attachments, ownerId });

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED, smallClaim, decodedToken);

    return res.status(201).send({
      success: true,
      message: "small claim successfully created",
      smallClaim,
    });
  }

  smallClaimExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that the small claim with id ${id} exits`);
      const smallClaim = await SmallClaimsService.find(id, context);
      if (!smallClaim) return next(createError(404, "The small claim can not be found"));
      req.oldSmallClaim = smallClaim;
      return next();
    };
  }

  async modifyClaim(req, res, next) {
    const {
      body,
      oldSmallClaim,
      params: { id },
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(id, body, oldSmallClaim);
    return res.status(200).send({
      success: true,
      message: "small claim successfully updated",
      smallClaim: updatedSmallClaim,
    });
  }

  async deleteClaim(req, res, next) {
    const { id } = req.params;
    log(`deleting an small claim with id ${id}`);
    const deletedSmallClaim = await SmallClaimsService.remove(id);

    return res.status(200).send({
      success: true,
      message: "small claim successfully deleted",
      smallClaim: deletedSmallClaim,
    });
  }

  getASmallClaim(req, res, next) {
    const { oldSmallClaim } = req;
    return res.status(200).send({
      success: true,
      message: "small claim successfully retrieved",
      smallClaim: oldSmallClaim,
    });
  }

  async getAllSmallClaims(req, res, next) {
    log("getting all small claims");
    const {
      filter,
      query: { paginate = {} },
    } = req;
    const smallClaims = await SmallClaimsService.findMany(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "small claims successfully retrieved",
      smallClaims: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...smallClaims,
      },
    });
  }

  async getUnassignedClaims(req, res, next) {
    log("getting all unassigned small claims");

    const data = { assignedLawyerId: null };
    const smallClaims = await SmallClaimsService.findMany(data, true);
    return res.status(200).send({
      success: true,
      message: "small claims successfully retrieved",
      smallClaims,
    });
  }

  async marKAsCompleted(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      decodedToken,
      oldSmallClaim,
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { status: "completed" },
      oldSmallClaim
    );
    eventEmitter.emit(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_COMPLETED,
      updatedSmallClaim,
      decodedToken
    );

    return res.status(200).send({
      success: true,
      message: "You have successfully completed this small claim",
      smallClaim: updatedSmallClaim,
    });
  }

  async updateToInProgress(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      decodedToken,
      oldSmallClaim,
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { status: "in-progress" },
      oldSmallClaim
    );
    eventEmitter.emit(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_IN_PROGRESS,
      updatedSmallClaim,
      decodedToken
    );

    return res.status(200).send({
      success: true,
      message: "You have successfully started this claim",
      smallClaim: updatedSmallClaim,
    });
  }

  async marKInterest(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      body: { baseCharge, serviceCharge },
      oldSmallClaim,
      decodedToken: { id: lawyerId },
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { baseCharge, serviceCharge, lawyerId },
      oldSmallClaim
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, {
      data: updatedSmallClaim,
      decodedToken: req.decodedToken,
    });

    return res.status(200).send({
      success: true,
      message: "You have successfully indicated interest in this small claim",
      smallClaim: updatedSmallClaim,
    });
  }

  async assignALawyer(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      body: { assignedLawyerId },
      decodedToken,
      oldSmallClaim,
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { assignedLawyerId },
      oldSmallClaim
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.ASSIGNED, updatedSmallClaim, decodedToken);

    return res.status(200).send({
      success: true,
      message: "You have successfully assigned a lawyer to this small claim kindly make payment",
      smallClaim: updatedSmallClaim,
    });
  }

  async getStats(req, res, next) {
    log("getting statistics for small claims");

    const allStats = await SmallClaimsService.stats();
    return res.status(200).send({
      success: true,
      message: "small claims statistics successfully retrieved",
      allStats,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        body: { assignedLawyerId },
        oldSmallClaim: { ownerId, status, interestedLawyers, assignedLawyerId: lawyerId },
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      if (role === "lawyer") {
        if (lawyerId && lawyerId === id)
          return next(createError(401, `You do not have access to ${context} this small claim`));
      }
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this small claim`));
      }

      if ((context === "delete" || context === "modify") && status !== "initiated") {
        return next(
          createError(401, `You can not ${context} a small claim once it has been assigned`)
        );
      }

      if (context === "assignLawyer") {
        if (status === "in-progress")
          return next(createError(403, `A lawyer has already been assigned to this small claim`));

        const lawyerMarkedInterest = interestedLawyers.find(
          (lawyer) => lawyer.profile.id == assignedLawyerId
        );
        if (!lawyerMarkedInterest)
          return next(createError(400, "You can't assign a lawyer that didn't marked interest"));
      }

      return next();
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldSmallClaim,
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "markAsComplete") {
        if (id !== oldSmallClaim.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
        if (oldSmallClaim.status !== "in-progress") {
          return next(
            createError(401, "You have to start this claim before marking it as completed")
          );
        }
      }

      if (context === "updateStatus") {
        if (!oldSmallClaim.paid)
          return next(createError(401, "You can not start a claim that hasn't been paid for"));
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

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = "";

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = filter
          ? `${filter} AND "SmallClaims"."ownerId" = '${query.search.ownerId}'`
          : `"SmallClaims"."ownerId" = '${query.search.ownerId}'`;
      }

      if (query.search && query.search.ticketId) {
        filter = filter
          ? `${filter} AND "SmallClaims"."ticketId" ILIKE '%${query.search.ticketId}%'`
          : `"SmallClaims"."ticketId" ILIKE '%${query.search.ticketId}%'`;
      }

      if (query.search && query.search.paid) {
        filter = filter
          ? `${filter} AND "SmallClaims"."paid" = ${query.search.paid}`
          : `"SmallClaims"."paid" = ${query.search.paid}`;
      }

      if (query.search && query.search.status) {
        filter = filter
          ? `${filter} AND "SmallClaims"."status" = '${query.search.status}'`
          : `"SmallClaims"."status" = '${query.search.status}'`;
      }

      if (query.search && query.search.assignedLawyerId) {
        filter = filter
          ? `${filter} AND "SmallClaims"."assignedLawyerId" = '${query.search.assignedLawyerId}'`
          : `"SmallClaims"."assignedLawyerId" = '${query.search.assignedLawyerId}'`;
      }
    }

    if (role === "lawyer") {
      filter = `${filter} "SmallClaims"."assignedLawyerId" = '${id}'`;

      if (query.search && query.search.ticketId) {
        filter = `${filter} AND "SmallClaims"."ticketId" ILIKE '%${query.search.ticketId}%'`;
      }
    }

    if (role === "user") {
      filter = `${filter} "SmallClaims"."ownerId" = '${id}'`;

      if (query.search && query.search.ticketId) {
        filter = `${filter} AND "SmallClaims"."ticketId" ILIKE '%${query.search.ticketId}%'`;
      }
    }

    req.filter = filter;
    return next();
  }
}

export default SmallClaimsController.getInstance();
