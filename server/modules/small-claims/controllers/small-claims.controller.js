import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import SmallClaimsService from "../services/small-claims.service";
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

    const { body, attachments = [] } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new SmallClaim for user with id ${ownerId}`);
    const smallClaim = await SmallClaimsService.create({ ...body, attachments, ownerId });

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED, smallClaim, "SMALL_CLAIM");

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
      next();
    };
  }

  async modifyClaim(req, res, next) {
    const {
      body,
      oldSmallClaim,
      params: { id },
    } = req;
    if (body.assignedLawyerId) {
      body.status = "in-progress";
    }
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
    log("getting all SmallClaims");
    const { data } = req;
    const smallClaims = await SmallClaimsService.findMany(data);
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
      oldSmallClaim,
    } = req;

    const filter = { where: { id }, returning: true };
    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { status: "completed" },
      oldSmallClaim,
      filter
    );
    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_COMPLETED, updatedSmallClaim);

    return res.status(200).send({
      success: true,
      message: "You have successfully completed this small claim",
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

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, updatedSmallClaim);

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
      oldSmallClaim,
    } = req;

    const [, [updatedSmallClaim]] = await SmallClaimsService.update(
      id,
      { status: "in-progress", assignedLawyerId },
      oldSmallClaim
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.ASSIGNED, updatedSmallClaim);

    return res.status(200).send({
      success: true,
      message: "You have successfully assigned a lawyer to this small claim",
      smallClaim: updatedSmallClaim,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        body: { assignedLawyerId },
        oldSmallClaim: { ownerId, status, interestedLawyers },
      } = req;
      if (role === "lawyer")
        return next(createError(401, `You do not have access to ${context} this small claim`));
      if (role === "admin" || role === "super-admin") next();
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
          next(createError(403, `A lawyer has already been assigned to this small claim`));
        const lawyerMarkedInterest = interestedLawyers[assignedLawyerId];
        if (!lawyerMarkedInterest)
          return next(createError(400, "You can't assign a lawyer that didn't marked interest"));
      }

      next();
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldSmallClaim,
      } = req;
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "markAsComplete") {
        if (id !== oldSmallClaim.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
      }
      next();
    };
  }

  queryContext(req, res, next) {
    const { role, id } = req.decodedToken;
    if (role === "admin" || role === "super-admin") {
      req.data = {};
    }
    if (role === "lawyer") {
      req.data = { where: { status: "initiated" } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    next();
  }
}

export default SmallClaimsController.getInstance();
