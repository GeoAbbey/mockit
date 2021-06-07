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
    log(`deleting a AuthCode with id ${id}`);
    const deletedAuthCode = await AuthCodesService.remove(id);
    return res.status(200).send({
      success: true,
      message: "AuthCode successfully deleted",
      AuthCode: deletedAuthCode,
    });
  }

  authCodeExists(req, res, next) {
    const { oldAuthCode } = req;
    return res.status(200).send({
      success: true,
      message: "auth code has been successfully deleted.",
      AuthCode: oldAuthCode,
    });
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
