import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";
import { paginate as pagination } from "../../helpers";

import CooperateAccessService from "../services/cooperate-access.services";
const logger = debug("app:cooperate-access-controller");

class CooperateAccessController {
  static instance;
  static getInstance() {
    if (!CooperateAccessController.instance) {
      CooperateAccessController.instance = new CooperateAccessController();
    }
    return CooperateAccessController.instance;
  }

  async grantCooperateAccess(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body: { userEmail },
      decodedToken: { id: ownerId },
    } = req;

    logger(`granting access to a user with email ${userEmail} by user with id ${ownerId}`);

    const result = await CooperateAccessService.findOrCreate({ ownerId, userEmail });
    if (result.success === false) return next(createError(400, result.message));

    eventEmitter.emit(EVENT_IDENTIFIERS.COOPERATE_ACCESS.GRANTED, {
      data: result.data,
      decodedToken: req.decodedToken,
    });

    return res.status(201).send({
      success: true,
      message: result.message,
      result: result.data,
    });
  }

  async allUsersWithAccess(req, res, next) {
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const { offset, limit } = pagination(paginate);
    const usersWithAccess = await CooperateAccessService.findMany(filter, paginate);

    return res.status(200).send({
      success: true,
      message: "users successfully retrieved",
      usersWithAccess: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...usersWithAccess,
      },
    });
  }

  async deleteCooperateAccess(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const {
      params: { id: userAccessId },
      decodedToken: { id: ownerId },
    } = req;
    const found = await CooperateAccessService.remove({ userAccessId, ownerId });

    eventEmitter.emit(EVENT_IDENTIFIERS.COOPERATE_ACCESS.REVOKED, {
      data: { userAccessId, ownerId, dataValues: { userAccessId, ownerId } },
      decodedToken: req.decodedToken,
    });

    res.status(201).send({
      success: true,
      message: "access successfully deleted",
      access: found,
    });
  }

  async cooperateAccessExists(req, res, next) {
    const {
      params: { id: userAccessId },
      decodedToken: { id: ownerId },
    } = req;
    const found = await CooperateAccessService.findOne({ userAccessId, ownerId });
    if (!found) return next(createError(404, `The resource can not be found`));

    req.oldCooperateAccess = found;
    return next();
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldAuthCode: { ownerId },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this auth code`));
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

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }
    }

    if (role === "user" || role === "lawyer") {
      filter = { ...filter, ownerId: id };
    }

    req.filter = filter;
    return next();
  }
}

export default CooperateAccessController.getInstance();
