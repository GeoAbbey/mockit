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
    const { lawyerId, modelId, modelType } = JSON.parse(PayoutDTO.reason);

    const isAlreadyPaid = await models.Payout.findOne({ where: { lawyerId, modelId, modelType } });
    if (isAlreadyPaid) {
      debugLog(`Lawyer with ID ${lawyerId} has already been paid for ${modelType} with ${modelId}`);
      return {
        success: false,
        response: `Lawyer with ID ${lawyerId} has already been paid for ${modelType} with ${modelId}`,
      };
    } else {
      const res = await payment.transfer(PayoutDTO);
      if (res.success === false) return res;

      const dataFromPayStack = {
        data: res.response.data,
        code: res.response.data.transfer_code,
        payStackId: res.response.data.id,
        modelType,
        modelId,
        lawyerId,
      };
      return models.Payout.create(dataFromPayStack);
    }
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
