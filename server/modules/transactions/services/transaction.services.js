import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:transaction-service");

class TransactionsService {
  static instance;
  static getInstance() {
    if (!TransactionsService.instance) {
      TransactionsService.instance = new TransactionsService();
    }
    return TransactionsService.instance;
  }

  async create(TransactionDTO, t = undefined) {
    debugLog("creating a Transaction");
    return models.Transaction.create(TransactionDTO, t);
  }

  async find(id) {
    debugLog(`looking for a Transaction with id ${id}`);
    return models.Transaction.findByPk(id);
  }

  async findMany(id) {
    debugLog(`getting a list of transaction with for user with id ${id}`);
    return models.Transaction.findAll({ where: { ownerId: id } });
  }

  async usageHistory(code) {
    debugLog(`getting a list of transaction with for user with code ${code}`);
    return models.Transaction.findAll({ where: { code } });
  }

  async remove(id) {
    debugLog(`deleting a review with ${id}`);
    return models.Transaction.destroy({ where: { id } });
  }
}

export default TransactionsService.getInstance();
