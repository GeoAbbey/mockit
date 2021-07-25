import debug from "debug";
import models from "../../../models";
import CooperateService from "../../cooperate/services/cooperate.services";
import { paginate } from "../../helpers";
import UsersService from "../../users/service/user.service";

const debugLog = debug("app:cooperate-access-service");

class CooperateAccessService {
  static instance;
  static getInstance() {
    if (!CooperateAccessService.instance) {
      CooperateAccessService.instance = new CooperateAccessService();
    }
    return CooperateAccessService.instance;
  }

  async find(id, t = undefined) {
    debugLog(`looking for an auth code with id ${id}`);

    return models.CooperateAccess.findByPk(id, t);
  }

  async findOrCreate({ ownerId, userEmail }) {
    const foundUser = await UsersService.findOne(userEmail);
    if (!foundUser) return { success: false, message: `user doesn't exist on the app` };

    const [data, isCreated] = await models.CooperateAccess.findOrCreate({
      where: { ownerId, userEmail },
      defaults: {
        ownerId,
        userEmail,
      },
    });

    if (isCreated)
      return { success: true, message: `user has been successfully granted access`, data };
    else return { success: false, message: `user already exists on the account` };
  }

  async findOne({ userEmail, ownerId }, t = undefined) {
    debugLog(`looking for an access code with email ${userEmail}`);

    return models.CooperateAccess.findOne({ where: { userEmail, ownerId } });
  }

  async findMany(filter, pageDetails) {
    debugLog(
      `looking for all users with access with cooperate account of users with filter ${filter}`
    );

    return models.CooperateAccess.findAndCountAll({
      where: { ...filter },
      ...paginate(pageDetails),
      order: [["createdAt", "DESC"]],
    });
  }

  async remove({ userEmail, ownerId }, t = undefined) {
    debugLog(`deleting access for user with email ${userEmail}`);
    return models.CooperateAccess.destroy({
      where: { userEmail, ownerId },
      ...t,
    });
  }
}

export default CooperateAccessService.getInstance();
