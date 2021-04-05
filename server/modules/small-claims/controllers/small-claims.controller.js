import debug from "debug";
import createError from "http-errors";

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
    const { body } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new SmallClaim for user with id ${ownerId}`);
    const smallClaim = await SmallClaimsService.create({ ...body, ownerId });

    return res.status(201).send({
      success: true,
      message: "small claim successfully created",
      smallClaim,
    });
  }

  async smallClaimExits(req, res, next) {
    const { id } = req.params;
    log(`verifying that the small claim with id ${id} exits`);
    const smallClaim = await SmallClaimsService.find(id);
    if (!smallClaim) return next(createError(404, "The small claim can not be found"));
    req.oldSmallClaim = smallClaim;
    next();
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

    console.log({ updatedSmallClaim });
    return res.status(200).send({
      success: true,
      message: "You have successfully completed this small claim",
      smallClaim: updatedSmallClaim,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        body,
        oldSmallClaim: { ownerId, status },
      } = req;
      if (role === "admin" || role === "super-admin") next();
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this small claim`));
      }
      // if (role === "user" && id === ownerId && body.assignedLawyerId)
      //   return next(createError(403, "you can't assign a lawyer to yourself"));
      if (context !== "retrieve") {
        if (role === "user" && status !== "initiated")
          return next(
            createError(401, `You can't ${context} an small claim once it has been assigned`)
          );
      }
      next();
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldSmallClaim,
        body,
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
      req.data = { where: { assignedLawyerId: id } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    next();
  }
}

export default SmallClaimsController.getInstance();
