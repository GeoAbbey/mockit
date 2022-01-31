import debug from "debug";
import createError from "http-errors";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

import WithdrawalsService from "../services/withdrawals.services";
import { EVENT_IDENTIFIERS } from "../../../constants";

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
    const eventEmitter = req.app.get("eventEmitter");

    const {
      decodedToken: { firstName, lastName, id, email },
      body: { amount },
      params: { accountCode },
    } = req;
    log(`creating a withdrawal for user with id ${id}`);

    const response = await WithdrawalsService.create({
      name: `${firstName} ${lastName}`,
      amount,
      id,
      email,
      accountCode,
    });

    response.success &&
      eventEmitter.emit(EVENT_IDENTIFIERS.WITHDRAWAL.INITIATED, {
        data: response.withdrawal,
        decodedToken: req.decodedToken,
      });

    return res.status(201).send({
      ...response,
    });
  }

  withdrawalExist(context) {
    return async (req, res, next) => {
      const {
        params: { id },
      } = req;
      const withdrawal = await WithdrawalsService.find(id);
      if (!withdrawal) return next(createError(404, `The withdrawal cant be found`));

      req.oldWithdrawal = withdrawal;
      return next();
    };
  }

  async getAWithdrawal(req, res, next) {
    const { oldWithdrawal } = req;
    return res.status(200).send({
      success: true,
      message: "Withdrawal successfully retrieved",
      withdrawal: oldWithdrawal,
    });
  }

  async authorizeAWithdrawal(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      oldWithdrawal,
      params: { id },
      decodedToken: { id: adminId },
      monnifyToken,
    } = req;

    const [, [withdrawal]] = await WithdrawalsService.update({
      id,
      adminId,
      oldWithdrawal,
      monnifyToken,
    });

    eventEmitter.emit(EVENT_IDENTIFIERS.WITHDRAWAL.AUTHORIZED, {
      data: withdrawal,
      decodedToken: req.decodedToken,
    });

    return res.status(200).send({
      success: true,
      message: "withdrawal successfully finalized",
      withdrawal,
    });
  }

  async getAllWithdrawals(req, res, next) {
    const {
      filter,
      paranoid,
      query: { paginate = {} },
    } = req;

    const withdrawals = await WithdrawalsService.findMany(filter, paginate, paranoid);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "withdrawals successfully retrieved",
      withdrawals: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...withdrawals,
      },
    });
  }

  async softDeleteAWithdrawal(req, res, next) {
    const {
      params: { id },
    } = req;

    const Withdrawal = await WithdrawalsService.delete(id);

    return res.status(200).send({
      success: true,
      message: "account successfully deleted",
      Withdrawal,
    });
  }

  async resendOTP(req, res, next) {
    const {
      body: { reference },
      monnifyToken,
    } = req;

    const response = await WithdrawalsService.resendOTP({ reference, monnifyToken });

    return res.status(200).send({
      success: true,
      response,
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

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldWithdrawal,
      } = req;
      if (role === "admin" || role === "super-admin") return next();

      if (role === "user")
        return next(createError(401, `You do not have access to ${context} this resource`));

      if (role === "lawyer" && id !== oldWithdrawal.ownerId) {
        return next(createError(401, `You do not have access to ${context} this withdrawal`));
      }

      return next();
    };
  }

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role },
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(401, `You do not have access to perform this operation`));
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter,
      paranoid = {};

    const commonOptions = () => {
      if (query.search && query.search.ticketId) {
        filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }

      if (query.search && query.search.reference) {
        filter = { ...filter, reference: query.search.reference };
      }

      paranoid = { paranoid: false };
      commonOptions();
    }

    if (role === "lawyer") {
      filter = { ...filter, ownerId: id };
      paranoid = { paranoid: true };
      commonOptions();
    }

    req.filter = filter;
    req.paranoid = paranoid;
    return next();
  }
}

export default WithdrawalsController.getInstance();
