import debug from "debug";
import createError from "http-errors";

import AuthCodesService from "../services/auth-code.services";
const log = debug("app:AuthCodes-controller");

class AuthCodesController {
  static instance;
  static getInstance() {
    if (!AuthCodesController.instance) {
      AuthCodesController.instance = new AuthCodesController();
    }
    return AuthCodesController.instance;
  }

  async deleteAuthCode(req, res, next) {
    const { id } = req.params;
    log(`deleting a auth code with id ${id}`);
    const deletedAuthCode = await AuthCodesService.remove(id);
    return res.status(200).send({
      success: true,
      message: "credit successfully deleted",
      authCode: deletedAuthCode,
    });
  }

  async getAuthCodes(req, res, next) {
    const { decodedToken: { id }} = req;
    log(`retrieving all auth code with for user with id ${id}`);

    const cards = await AuthCodesService.findMany(id);

    return res.status(200).send({
      success: true,
      message: "credit successfully deleted",
      cards,
    });
  }

  async authCodeExists(req, res, next) {
    const { id } = req.params;
    const result = await AuthCodesService.find(id);
    if (!result) return next(createError(404, `The requested credit card cannot be found`));

    req.oldAuthCode = result;
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

export default AuthCodesController.getInstance();
