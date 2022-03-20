import debug from "debug";
import models from "../../../models";
import { paginate } from "../../helpers";

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

  async findMany(filter, pageDetails) {
    debugLog(`getting a list of transaction with for user with id ${JSON.stringify(filter)}`);

    return models.Transaction.findAndCountAll({
      where: { ...filter },
      ...paginate(pageDetails),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
      ],
    });
  }

  async remove(id) {
    debugLog(`deleting a review with ${id}`);
    return models.Transaction.destroy({ where: { id } });
  }
}

export default TransactionsService.getInstance();
