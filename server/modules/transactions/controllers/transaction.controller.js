import debug from "debug";
import createError from "http-errors";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

import TransactionsService from "../services/transaction.services";
import { pgDateFormate } from "../../../utils/pgFormateDate";
const log = debug("app:transactions-controller");

class TransactionsController {
  static instance;
  static getInstance() {
    if (!TransactionsController.instance) {
      TransactionsController.instance = new TransactionsController();
    }

    return TransactionsController.instance;
  }

  async createTransaction(req, res, next) {
    const {
      body: { amount, modelId, modelType },
      decodedToken: { id: performedBy },
      params: { ownerId },
    } = req;
    log(`creating a transaction for user with id ${ownerId}`);
    const transaction = await TransactionsService.create({
      ownerId,
      amount,
      modelId,
      performedBy,
      modelType,
    });

    return res.status(201).send({
      success: true,
      message: "Transaction successfully created",
      transaction,
    });
  }

  transactionExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that an Transaction with id ${id} exits`);
      const transaction = await TransactionsService.find(id);
      if (!transaction) return next(createError(404, "The transaction can not be found"));
      req.oldTransaction = transaction;
      return next();
    };
  }

  async getAllTransactions(req, res, next) {
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const transactions = await TransactionsService.findMany(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "Transaction successfully created",
      transactions: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...transactions,
      },
    });
  }

  async deleteTransaction(req, res, next) {
    const { id } = req.params;
    log(`deleting a transaction with id ${id}`);
    const transaction = await TransactionsService.remove(id);
    return res.status(200).send({
      success: true,
      message: "Transaction successfully created",
      transaction,
    });
  }

  async modifyTransaction(req, res, next) {}

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(401, "You are not permitted to access this route"));
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    const commonOptions = () => {
      if (query.search && query.search.ticketId) {
        filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
      }

      if (query.search && query.search.code) {
        filter = { ...filter, code: { [Op.iLike]: `%${query.search.code}%` } };
      }

      if (query.search && query.search.notes) {
        filter = { ...filter, notes: { [Op.iLike]: `%${query.search.notes}%` } };
      }

      if (query.search && query.search.to && query.search.from) {
        filter = {
          ...filter,
          createdAt: {
            [Op.between]: [pgDateFormate(query.search.from), pgDateFormate(query.search.to)],
          },
        };
      }

      if (query.search && query.search.modelType) {
        filter = { ...filter, modelType: query.search.modelType };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }

      commonOptions();
    }

    if (role === "user" || role === "lawyer") {
      commonOptions();

      if (!query.search.code) filter = { ...filter, ownerId: id };
    }

    req.filter = filter;
    return next();
  }
}

export default TransactionsController.getInstance();
