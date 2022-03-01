import debug from "debug";
import models from "../../../models";
import { paginate } from "../../helpers";

const debugLog = debug("app:pay-in-service");

class PayInsService {
  static instance;
  static getInstance() {
    if (!PayInsService.instance) {
      PayInsService.instance = new PayInsService();
    }
    return PayInsService.instance;
  }

  async create(PayInDTO, t = undefined) {
    debugLog("creating a pay in");
    return models.PayIn.create(PayInDTO, t);
  }

  async find(reference, ownerId, t = undefined) {
    debugLog(`looking for a pay in with reference ${reference}`);
    return models.PayIn.findOne({ where: { reference, ownerId } }, t);
  }

  async findMany(filter, pageDetails) {
    debugLog("retrieving the payIn history with the following filter", JSON.stringify(filter));

    return models.PayIn.findAndCountAll({
      where: { ...filter },
      order: [["createdAt", "DESC"]],
      ...paginate(pageDetails),
      include: [
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
      ],
    });
  }

  async remove(id) {
    debugLog(`deleting a review with ${id}`);
    return models.PayIn.destroy({ where: { id } });
  }
}

export default PayInsService.getInstance();
