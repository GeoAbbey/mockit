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
    return models.Recipient.findByPk(id);
  }

  async update(id, RecipientDTO, oldRecipient) {
    const { description, account_number, bank_code } = oldRecipient;

    return models.Recipient.update(
      {
        description: RecipientDTO.description || description,
        account_number: RecipientDTO.account_number || account_number,
        bank_code: RecipientDTO.bank_code || bank_code,
      },
      { where: { id }, returning: true, ...t }
    );
  }

  async findMany() {
    return payment.getBankCodes();
  }

  async delete(id, oldRecipient) {
    const result = await payment.deleteRecipient(oldRecipient.code);
    if (result.success === false) return null;
    else
      return models.Recipient.destroy({
        where: { id },
      });
  }
}

export default RecipientsService.getInstance();
