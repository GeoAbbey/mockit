import debug from "debug";
import models from "../../../models";
import { paginate } from "../../helpers";

const debugLog = debug("app:AuthCodes-service");

class AuthCodesService {
  static instance;
  static getInstance() {
    if (!AuthCodesService.instance) {
      AuthCodesService.instance = new AuthCodesService();
    }
    return AuthCodesService.instance;
  }

  async findOrCreate(AuthCodeDTO) {
    debugLog("creating a auth code");
    return models.AuthCode.findOrCreate(AuthCodeDTO);
  }

  async find(id, t = undefined) {
    debugLog(`looking for an auth code with id ${id}`);

    return models.AuthCode.findByPk(id, t);
  }

  async findMany(id, pageDetails) {
    debugLog(`looking for an auth code with id ${id}`);

    return models.AuthCode.findAndCountAll({
      where: { ownerId: id },
      ...paginate(pageDetails),
      order: [["createdAt", "DESC"]],
    });
  }

  async remove(id, t = undefined) {
    debugLog(`deleting the auth code with id ${id}`);
    return models.AuthCode.destroy({
      where: { id },
      ...t,
    });
  }
}

export default AuthCodesService.getInstance();
