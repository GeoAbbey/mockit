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

  async find(id) {
    debugLog(`retrieving recipient with ${id}`);
    return models.Recipient.findAll({ where: { lawyerId: id } });
  }

  async findByCode(filter) {
    debugLog(`retrieving recipient  account with code ${JSON.stringify(filter)}`);
    return models.Recipient.findOne({ where: { ...filter } });
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

  async delete(id, oldRecipient) {
    return models.Recipient.destroy({
      where: { lawyerId: id, code: oldRecipient.code },
    });
  }
}

export default RecipientsService.getInstance();
