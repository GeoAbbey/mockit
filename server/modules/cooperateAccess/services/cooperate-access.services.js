import debug from "debug";
import { ROLES } from "../../../constants";
import models from "../../../models";
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
    const foundUser = await UsersService.findOne({ email: userEmail, role: ROLES.USER });
    if (!foundUser)
      return { success: false, message: `No user with the provided email address ${userEmail} ` };

    const [data, isCreated] = await models.CooperateAccess.findOrCreate({
      where: { ownerId, userAccessId: foundUser.dataValues.id },
      defaults: {
        ownerId,
        userAccessId: foundUser.dataValues.id,
      },
    });

    if (isCreated)
      return { success: true, message: `user has been successfully granted access`, data };
    else return { success: false, message: `user already exists on the account` };
  }

  async findOne({ userAccessId, ownerId }, t = undefined) {
    debugLog(`looking for an access code with email ${userAccessId}`);

    return models.CooperateAccess.findOne({ where: { userAccessId, ownerId } });
  }

  async findMany(filter, pageDetails) {
    debugLog(
      `looking for all users with access with cooperate account of users with filter ${filter}`
    );

    return models.CooperateAccess.findAndCountAll({
      where: { ...filter },
      ...paginate(pageDetails),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.User,
          as: "userWithAccessProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
      ],
    });
  }

  async remove({ userAccessId, ownerId }, t = undefined) {
    debugLog(`deleting access for user with email ${userAccessId}`);
    return models.CooperateAccess.destroy({
      where: { userAccessId, ownerId },
      ...t,
    });
  }
}

export default CooperateAccessService.getInstance();
