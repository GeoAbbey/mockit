import debug from "debug";
import models from "../../../models";
import axios from "axios";

const debugLog = debug("app:recipients-service");

import { payStack } from "../../../utils/paymentService";

const payment = payStack(axios);

class RecipientsService {
  static instance;
  static getInstance() {
    if (!RecipientsService.instance) {
      RecipientsService.instance = new RecipientsService();
    }
    return RecipientsService.instance;
  }

  async create(RecipientDTO) {
    debugLog("creating a recipient");
    return models.Recipient.create(RecipientDTO);
  }

  async find({ lawyerId, id }) {
    debugLog(`retrieving recipient with lawyerId ${lawyerId}`);
    let search = { lawyerId };
    if (id) search = { ...search, id };
    return models.Recipient.findAll({ where: search });
  }

  async findOne({ bank_code, account_number, id }) {
    debugLog(`retrieving recipient with bankCode ${bank_code} and accountNumber ${account_number}`);

    return models.Recipient.findOne({
      where: {
        lawyerId: id,
        details: {
          bankCode: bank_code,
          accountNumber: account_number,
        },
      },
    });
  }

  async findMany(data) {
    return payment.getBankCodes(data);
  }

  async delete(id) {
    return models.Recipient.destroy({
      where: { id },
    });
  }
}

export default RecipientsService.getInstance();
