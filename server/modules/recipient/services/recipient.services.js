import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:recipients-service");

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
}

export default RecipientsService.getInstance();
