import debug from "debug";
import createError from "http-errors";

import PayoutsService from "../../payout/services/payout.services";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";
import WithdrawalService from "../../withdrawals/services/withdrawals.services";
import { pgDateFormate } from "../../../utils/pgFormateDate";

const log = debug("app:payout-withdrawal-controller");

class PayoutAndWithdrawalController {
  static instance;
  static getInstance() {
    if (!PayoutAndWithdrawalController.instance) {
      PayoutAndWithdrawalController.instance = new PayoutAndWithdrawalController();
    }
    return PayoutAndWithdrawalController.instance;
  }

  async getHistory(req, res, next) {
    log("getting combined transaction history of both payout and withdrawals");
    const {
      filter = {},
      query: { paginate = {} },
    } = req;

    const payoutHistory = await PayoutsService.getHistory(filter, paginate);
    delete filter.modelType;
    const withdrawalHistory = await WithdrawalService.findMany(filter, paginate, false);

    const history = [...payoutHistory.rows, ...withdrawalHistory.rows];

    history.sort((firstItem, secondItem) => secondItem.createdAt - firstItem.createdAt);

    const { offset, limit } = pagination(paginate);

    return res.status(201).send({
      success: true,
      message: "Payout successfully created",
      history: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        history,
      },
    });
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
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }
      commonOptions();
    }

    if (role === "lawyer") {
      filter = { ...filter, ownerId: id };
      commonOptions();
    }

    req.filter = filter;
    return next();
  }
}

export default PayoutAndWithdrawalController.getInstance();
