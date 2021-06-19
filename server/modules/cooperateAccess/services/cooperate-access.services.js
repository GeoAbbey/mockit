import debug from "debug";
import models from "../../../models";
import CooperateService from "../../cooperate/services/cooperate.services";

const debugLog = debug("app:cooperate-access-service");

class CooperateAccessService {
  static instance;
  static getInstance() {
    if (!CooperateAccessService.instance) {
      CooperateAccessService.instance = new CooperateAccessService();
    }
    return CooperateAccessService.instance;
  }

  async bulkCreate(CooperateAccessDTO, ownerId) {
    debugLog("adding users to a particular cooperate access");
    // check if the ownerId has a cooperate Account.
    const isAccountFound = await CooperateService.find(ownerId);
    if (isAccountFound)
      return models.CooperateAccess.bulkCreate(CooperateAccessDTO, {
        updateOnDuplicate: ["userId", "ownerId"],
      });
    else return null;
  }

  async find(id, t = undefined) {
    debugLog(`looking for an auth code with id ${id}`);

    return models.CooperateAccess.findByPk(id, t);
  }

  async findOne({ id, ownerId }, t = undefined) {
    debugLog(`looking for an auth code with id ${id}`);

    return models.CooperateAccess.findOne({ where: { userId: id, ownerId } });
  }

  async remove({ id, ownerId }, t = undefined) {
    debugLog(`deleting the auth code with id ${id}`);
    return models.CooperateAccess.destroy({
      where: { userId: id, ownerId },
      t,
    });
  }
}

export default CooperateAccessService.getInstance();
