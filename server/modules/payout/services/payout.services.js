import debug from "debug";
import axios from "axios";

import models from "../../../models";
import { payStack } from "../../../utils/paymentService";
import { paginate } from "../../helpers";

const payment = payStack(axios);

const debugLog = debug("app:payouts-service");

class PayoutsService {
  static instance;
  static getInstance() {
    if (!PayoutsService.instance) {
      PayoutsService.instance = new PayoutsService();
    }
    return PayoutsService.instance;
  }

  async create(PayoutDTO) {
    debugLog("creating a Payout");
    //check if payment has already been made for the service.
    const { ownerId, modelId, modelType } = PayoutDTO;

    const isAlreadyPaid = await models.Payout.findOne({ where: { ownerId, modelId, modelType } });
    if (isAlreadyPaid) {
      debugLog(`User with ID ${ownerId} has already been paid for ${modelType} with ${modelId}`);
      return {
        success: false,
        response: `User with ID ${ownerId} has already been paid for ${modelType} with ${modelId}`,
      };
    } else {
      return models.Payout.create({ ...PayoutDTO, status: "in-progress" });
    }
  }

  async update(id, PayoutDTO, oldPayoutDTO, t = undefined) {
    debugLog(`updating status of payout to ${PayoutDTO.status}`);
    const { status } = oldPayoutDTO;
    return models.Payout.update(
      {
        status: PayoutDTO.status || status,
      },
      { where: { id }, returning: true, ...t }
    );
  }

  findOne(filter) {
    debugLog(`retrieving payout with the following data ${JSON.stringify(filter)}`);
    return models.Payout.findOne({ where: { ...filter } });
  }

  async getHistory(filter, pageDetails) {
    return models.Payout.findAndCountAll({
      where: { ...filter },
      ...paginate(pageDetails),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
      ],
    });
  }
}

export default PayoutsService.getInstance();
