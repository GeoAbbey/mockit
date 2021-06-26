import debug from "debug";
import createError from "http-errors";

import CooperateService from "../services/cooperate.services";
const log = debug("app:cooperate-controller");

class CooperateController {
  static instance;
  static getInstance() {
    if (!CooperateController.instance) {
      CooperateController.instance = new CooperateController();
    }
    return CooperateController.instance;
  }

  async createCooperate(req, res, next) {
    const {
      body,
      decodedToken: { id },
    } = req;

    log(`creating a co-operate with id ${id}`);

    const cooperate = await CooperateService.create({ ...body, id });
    return res.status(200).send({
      success: true,
      message: "co-operate account successfully created",
      cooperate,
    });
  }

  cooperateExists(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { id },
      } = req;

      const cooperateInfo = await CooperateService.find(id);

      if (!cooperateInfo)
        return next(createError(404, `You do not have a cooperate account kindly create one`));

      if (context) {
        return res.status(200).send({
          success: true,
          message: "cooperate info has been successfully retrieved.",
          cooperateInfo,
        });
      }

      req.oldCooperate = cooperateInfo;
      return next();
    };
  }

  async usageHistory(req, res, next) {
    const { oldCooperate } = req;

    const history = await CooperateService.usage(oldCooperate.code);

    return res.status(200).send({
      success: true,
      message: "cooperate info has been successfully retrieved.",
      history,
    });
  }

  async editCooperate(req, res, next) {
    const {
      decodedToken: { id },
      oldCooperate,
      body,
    } = req;

    const [, [updatedDetails]] = await CooperateService.update(id, body, oldCooperate);

    return res.status(200).send({
      success: true,
      message: "cooperate info has been successfully updated.",
      updatedDetails,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldCooperate: { ownerId },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this auth code`));
      }
      return next();
    };
  }
}

export default CooperateController.getInstance();
