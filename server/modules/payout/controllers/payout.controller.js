import debug from "debug";
import createError from "http-errors";

import PayoutsService from "../services/payout.services";
import configOptions from "../../../config/config";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";
import interestedLawyersServices from "../../interestedLawyers/services/interestedLawyers.services";
import { pgDateFormate } from "../../../utils/pgFormateDate";

const env = process.env.NODE_ENV || "development";
const config = configOptions[env];

const log = debug("app:payouts-controller");

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

  async getAmount(model) {
    const calAmount = async (model) => {
      const { claimId, lawyerId, percentage } = model;
      const { serviceCharge } = await interestedLawyersServices.findOne({
        modelId: claimId,
        lawyerId,
      });

      return serviceCharge * (percentage / 100);
    };

    const mapper = {
      invitation: () => config.invitationCost * (config.lawyerPercentage / 100),
      response: () => config.costOfSubscriptionUnit * (config.lawyerPercentage / 100),
      smallClaim: () => config.consultationFee * (config.lawyerConsultationPercentage / 100),
      mileStone: () => calAmount(model),
    };

    return mapper[model.type]();
  }

  async getHistory(req, res, next) {
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const history = await PayoutsService.getHistory(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(201).send({
      success: true,
      message: "Payout successfully created",
      history: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...history,
      },
    });
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

      if (role === "admin" || role === "super-admin") return next();

      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));

      return next();
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    const commonOptions = () => {
      if (query.search && query.search.modelType) {
        filter = { ...filter, modelType: query.search.modelType };
      }

      if (query.search && query.search.ticketId) {
        filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
      }
      if (query.search && query.search.to && query.search.from) {
        filter = {
          ...filter,
          createdAt: {
            [Op.between]: [pgDateFormate(query.search.from), pgDateFormate(query.search.to)],
          },
        };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.lawyerId) {
        filter = { ...filter, lawyerId: query.search.lawyerId };
      }
      commonOptions();
    }

    if (role === "lawyer") {
      filter = { ...filter, lawyerId: id };
      commonOptions();
    }

    req.filter = filter;
    return next();
  }
}

export default PayoutsController.getInstance();
