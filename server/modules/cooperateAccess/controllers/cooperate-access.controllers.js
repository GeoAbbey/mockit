import debug from "debug";
import createError from "http-errors";

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
    const {
      body: { userIds },
      decodedToken: { id: ownerId },
    } = req;
    const DTO = userIds.map((userId) => ({ userId, ownerId }));

    const result = await CooperateAccessService.bulkCreate(DTO, ownerId);
    if (!result) return next(createError(400, `You do not have a cooperate account`));

    return res.status(201).send({
      success: true,
      message: `users successfully addded`,
      result,
    });
  }

  async deleteCooperateAccess(req, res, next) {
    const {
      params: { id },
      decodedToken: { id: ownerId },
    } = req;
    const found = await CooperateAccessService.remove({ id, ownerId });

    res.status(201).send({
      success: true,
      message: "access successfully deleted",
      access: found,
    });
  }

  async cooperateAccessExists(req, res, next) {
    const {
      params: { id },
      decodedToken: { id: ownerId },
    } = req;
    const found = await CooperateAccessService.findOne({ id, ownerId });
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
}

export default CooperateAccessController.getInstance();
