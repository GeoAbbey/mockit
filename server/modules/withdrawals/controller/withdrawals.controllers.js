import debug from "debug";
import createError from "http-errors";
import axios from "axios";

import WithdrawalsService from "../services/withdrawals.services";

import { payStack } from "../../../utils/paymentService";
const payment = payStack(axios);
const log = debug("app:Withdrawals-controller");

class WithdrawalsController {
  static instance;
  static getInstance() {
    if (!WithdrawalsController.instance) {
      WithdrawalsController.instance = new WithdrawalsController();
    }
    return WithdrawalsController.instance;
  }

  async makeWithdrawal(req, res, next) {
    const {
      decodedToken: { firstName, lastName, id, email },
      body: { amount },
    } = req;
    log(`creating a withdrawal for user with id ${id}`);

    const withdrawal = await WithdrawalsService.create({
      name: `${firstName} ${lastName}`,
      amount,
      id,
      email,
    });

    return res.status(201).send({
      success: true,
      message: "Withdrawal successfully created",
      withdrawal,
    });
  }

  WithdrawalExist(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { id },
      } = req;
      const Withdrawal = await WithdrawalsService.find(id);
      if (!Withdrawal)
        return next(createError(404, `You don't have a Withdrawal account kindly create one`));

      if (context) {
        return res.status(200).send({
          success: true,
          message: `Withdrawal successfully ${context}`,
          Withdrawal,
        });
      }

      req.oldWithdrawal = Withdrawal;
      return next();
    };
  }

  async deleteWithdrawal(req, res, next) {
    const {
      decodedToken: { id },
      oldWithdrawal,
    } = req;

    const Withdrawal = await WithdrawalsService.delete(id, oldWithdrawal);

    return res.status(200).send({
      success: true,
      message: "account successfully deleted",
      Withdrawal,
    });
  }

  async getBankCodes(req, res, next) {
    const { response } = await WithdrawalsService.findMany();

    return res.status(200).send({
      success: true,
      message: response.message,
      response: response.data,
    });
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role },
      } = req;

      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));

      return next();
    };
  }
}

export default WithdrawalsController.getInstance();
