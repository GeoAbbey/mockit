import debug from "debug";
import createError from "http-errors";

import PayoutsService from "../../payout/services/payout.services";
import { paginate as pagination } from "../../helpers";
import WithdrawalService from "../../withdrawals/services/withdrawals.services";

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
      query: { paginate = {} },
    } = req;

    const payoutHistory = await PayoutsService.getHistory({}, paginate);
    const withdrawalHistory = await WithdrawalService.findMany({}, paginate, false);

    console.log({ payoutHistory, withdrawalHistory });

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
}

export default PayoutAndWithdrawalController.getInstance();
