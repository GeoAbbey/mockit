import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

import mileStonesService from "../service/milestone.service";
import smallClaimsService from "../../small-claims/services/small-claims.service";

const log = debug("app:mileStones-controller");
class mileStonesController {
  static instance;
  static getInstance() {
    if (!mileStonesController.instance) {
      mileStonesController.instance = new mileStonesController();
    }
    return mileStonesController.instance;
  }

  async makeMileStones(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body: { mileStones, claimId },
      decodedToken: { id: lawyerId },
    } = req;

    const totalPercentage = mileStones.reduce((prev, acc) => prev + acc.percentage, 0);
    if (totalPercentage !== 100)
      return next(
        createError(
          400,
          `total mile stone percentage must be equal to 100% not ${totalPercentage}%`
        )
      );

    const compileMileStones = mileStones.map((mileStone) => ({
      ...mileStone,
      claimId,
      lawyerId,
    }));

    log(`creating a new mileStone by lawyer with id ${lawyerId}`);
    const theMileStones = await mileStonesService.bulkCreate(compileMileStones);

    if (!theMileStones.success) return next(createError(400, theMileStones));

    eventEmitter.emit(EVENT_IDENTIFIERS.MILESTONE.CREATED, {
      decodedToken: req.decodedToken,
      theMileStones: mileStones,
    });

    return res.status(201).send(theMileStones);
  }

  mileStoneExits(context) {
    return async (req, res, next) => {
      if (context === "create") {
        const {
          body: { claimId },
        } = req;
        const mileStone = await mileStonesService.findOne({ claimId });
        if (mileStone) return next(createError(404, "The mile stones has already been created"));
        return next();
      } else {
        const { id } = req.params;
        log(`verifying that an mile stone with id ${id} exits`);
        const mileStone = await mileStonesService.find(id, context);
        if (!mileStone) return next(createError(404, "The mile stone can not be found"));
        req.oldMileStone = mileStone;
        return next();
      }
    };
  }

  async modifyMileStone(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body,
      oldMileStone,
      decodedToken,
      params: { id },
    } = req;

    const [, [updatedMileStone]] = await mileStonesService.update(id, body, oldMileStone);

    body.status === "completed" &&
      eventEmitter.emit(EVENT_IDENTIFIERS.MILESTONE.COMPLETED, {
        decodedToken,
        mileStone: updatedMileStone,
      });

    return res.status(200).send({
      success: true,
      message: "mileStone successfully updated",
      mileStone: updatedMileStone,
    });
  }

  getMileStone(req, res, next) {
    const { oldMileStone } = req;

    return res.status(200).send({
      success: true,
      message: "mileStone successfully retrieved",
      mileStone: oldMileStone,
    });
  }

  async getAllMileStones(req, res, next) {
    log("getting all invitations");

    const {
      filter,
      decodedToken: { role, id },
      query: { paginate = {} },
    } = req;

    if (role === "user") {
      if (!filter.claimId) return next(createError(404, "small claims ID is required"));
      const smallClaim = await smallClaimsService.find(filter.claimId);
      if (!smallClaim || smallClaim.ownerId !== id)
        return next(createError(404, "You do not have permission to access this resource"));
    }
    const mileStones = await mileStonesService.findMany(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "mile stones successfully retrieved",
      mileStones: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...mileStones,
      },
    });
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldMileStone,
        body,
      } = req;

      if (role !== "lawyer")
        return next(createError(401, "You do not have permission to access this route"));

      if (context === "modify" && oldMileStone.lawyerId !== id)
        return next(createError(401, "You do not have permission to access this route"));

      if (
        (body.status === "completed" && oldMileStone.status === "completed") ||
        (oldMileStone && !oldMileStone.paid)
      )
        return next(createError(401, "You do not have permission to access this route"));

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

      if (query.search && query.search.claimId) {
        filter = { ...filter, claimId: query.search.claimId };
      }

      if (query.search && query.search.status) {
        filter = { ...filter, status: query.search.status };
      }
    };

    if (role === "admin" || role === "super-admin") {
      commonOptions();

      if (query.search && query.search.lawyerId) {
        filter = { ...filter, lawyerId: query.search.lawyerId };
      }
    }

    if (role === "lawyer") {
      filter = { ...filter, lawyerId: id };

      commonOptions();
    }

    commonOptions();

    req.filter = filter;
    return next();
  }
}

export default mileStonesController.getInstance();
