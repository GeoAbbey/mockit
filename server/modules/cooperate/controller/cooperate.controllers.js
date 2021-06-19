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

  cooperateExists(req, res, next) {
    const { oldCooperate } = req;

    return res.status(200).send({
      success: true,
      message: "auth code has been successfully deleted.",
      Cooperate: oldCooperate,
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
