import debug from "debug";
import createError from "http-errors";

import TransactionsService from "../services/transaction.services";
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
      message: "transaction successfully created",
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
      decodedToken: { id },
    } = req;
    const transactions = await TransactionsService.findMany(id);

    return res.status(200).send({
      success: true,
      message: "transaction successfully created",
      transactions,
    });
  }

  async deleteTransaction(req, res, next) {
    const { id } = req.params;
    log(`deleting a transaction with id ${id}`);
    const transaction = await TransactionsService.remove(id);
    return res.status(200).send({
      success: true,
      message: "transaction successfully created",
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
}

export default TransactionsController.getInstance();
