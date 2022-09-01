import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import SmallClaimsService from "../services/small-claims.service";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";
import milestoneService from "../../mileStone/service/milestone.service";
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
    body.venue = JSON.parse(body.venue);
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
      const {
        params: { id },
        decodedToken: { role },
      } = req;

      if (role === "lawyer") context = req.decodedToken.id;

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

    const {
      query: { paginate = {} },
      decodedToken: {
        address: { country, state },
        id,
      },
    } = req;

    const canApply = (model) => ({
      model,
      as: "myInterest",
      required: false,
      where: { lawyerId: id },
    });

    const filter = {
      status: "initiated",
      paid: false,
      venue: { country, state },
    };

    const smallClaims = await SmallClaimsService.findMany(filter, paginate, canApply);
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

  async updateToNewState(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      body: { status },
      decodedToken,
      oldSmallClaim,
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { status: status },
      oldSmallClaim
    );
    eventEmitter.emit(
      EVENT_IDENTIFIERS.SMALL_CLAIM[status.toUpperCase()],
      updatedSmallClaim,
      decodedToken
    );

    return res.status(200).send({
      success: true,
      message: "You have successfully started this claim",
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
        params: { id: claimId },
        oldSmallClaim: { ownerId, status, interestedLawyers, assignedLawyerId: lawyerId },
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      if (role === "lawyer") {
        if (lawyerId && lawyerId !== id)
          return next(createError(401, `You do not have access to ${context} this small claim`));
      }
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this small claim`));
      }

      if ((context === "delete" || context === "modify") && status !== "initiated") {
        if (
          req.body.status === "closed" ||
          (req.body.status === "engagement" && status === "lawyer_consent")
        )
          return next();
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
        if (id !== oldSmallClaim.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));

        if (req.body.status === "cancelled") {
          const mileStones = await milestoneService.findMany(
            { claimId: oldSmallClaim.id },
            { page: 1, pageSize: 10 }
          );
          console.log({ mileStones });

          const theStone = mileStones.rows.find((mileStone) => mileStone.status === "in-progress");

          if (theStone)
            return next(
              createError(401, "Can not cancel claim once a mile stone has been paid for")
            );
        }

        if (!oldSmallClaim.paid)
          return next(
            createError(401, "You can not update the status of a claim that hasn't been paid for")
          );
        if (oldSmallClaim.status === req.body.status)
          return next(
            createError(401, `status of the claim that has already been ${req.body.status}`)
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

export default SmallClaimsController.getInstance();
