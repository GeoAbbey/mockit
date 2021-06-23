import debug from "debug";
import createError from "http-errors";

import PayoutsService from "../services/payout.services";
import SmallClaimsService from "../../small-claims/services/small-claims.service";
const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";

const config = configOptions[env];

const log = debug("app:Payouts-controller");

class PayoutsController {
  static instance;
  static getInstance() {
    if (!PayoutsController.instance) {
      PayoutsController.instance = new PayoutsController();
    }
    return PayoutsController.instance;
  }

  createPayout = async (req, res, next) => {
    const {
      decodedToken: { id },
      params: { code },
      body: { modelType, modelId, text, lawyerId },
    } = req;
    log(`creating a Payout for user with id ${id}`);

    const payout = await PayoutsService.create({
      recipient: code,
      reason: JSON.stringify({ modelType, modelId, text, id, lawyerId }),
      amount: await this.getAmount(modelType, modelId),
    });

    if (payout.success === false) return next(createError(400, payout.response));

    return res.status(201).send({
      success: true,
      message: "Payout successfully created",
      payout,
    });
  };

  async getAmount(modelType, modelId) {
    if (modelType === "invitation")
      return config.invitationCost * (config.lawyerPercentage / 100) * 100;
    if (modelType === "response")
      return config.costOfSubscriptionUnit * (config.lawyerPercentage / 100) * 100;
    if (modelType === "smallClaim") {
      const oldClaim = await SmallClaimsService.find(modelId, true);
      const lawyerId = oldClaim.dataValues.assignedLawyerId;
      const {
        dataValues: { baseCharge, serviceCharge },
      } = oldClaim.dataValues.interestedLawyers.find((lawyer) => lawyer.lawyerId === lawyerId);

      const totalCost = baseCharge + serviceCharge;
      return totalCost * (config.lawyerPercentage / 100) * 100;
    }
  }

  async getHistory(req, res, next){
    const {decodedToken: { id}} = req;
    const history = await PayoutsService.getHistory(id);

    return res.status(201).send({
      success: true,
      message: "Payout successfully created",
      history,
  })
}

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role },
      } = req;

      if (role === "admin" || role === "super-admin") return next();

      return next(createError(401, "You do not have access to perform this operation"));
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role },
      } = req;

      if (role !== "lawyer") return next(createError(401, "You do not have access to perform this operation"));

      return next();
    };
  }
}

export default PayoutsController.getInstance();
