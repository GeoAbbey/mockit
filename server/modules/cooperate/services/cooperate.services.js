import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:cooperate-service");
import TransactionsService from "../../transactions/services/transaction.services";

class CooperateService {
  static instance;
  static getInstance() {
    if (!CooperateService.instance) {
      CooperateService.instance = new CooperateService();
    }
    return CooperateService.instance;
  }

  async create(CooperateDTO) {
    debugLog("creating a cooperate account");
    return models.Cooperate.create(CooperateDTO);
  }

  async find(id, t = undefined) {
    debugLog(`looking for an auth code with id ${id}`);

    return models.Cooperate.findByPk(id, t);
  }

  async usage(code, pageDetails) {
    debugLog(`looking for transactions where code ${code} was used`);

    return TransactionsService.findMany({ code }, pageDetails);
  }

  async findOne(code) {
    debugLog(`looking for cooperate account with code ${code}`);
    return models.Cooperate.findOne({ where: { code } });
  }

  async update(id, CooperateDTO, oldCooperateDInfo, t = undefined) {
    const {
      walletAmount,
      companyAddress,
      companyEmail,
      companyName,
      contactPhone,
      contactName,
    } = oldCooperateDInfo;

    const handleAmount = (newValue, previousValue, operation) => {
      if (operation === "add") {
        return newValue + previousValue;
      } else return previousValue - newValue;
    };

    return models.Cooperate.update(
      {
        walletAmount: CooperateDTO.walletAmount
          ? handleAmount(CooperateDTO.walletAmount, walletAmount, CooperateDTO.operation)
          : walletAmount,
        companyName: CooperateDTO.companyName || companyName,
        companyAddress: CooperateDTO.companyAddress || companyAddress,
        companyEmail: CooperateDTO.companyEmail || companyEmail,
        contactName: CooperateDTO.contactName || contactName,
        contactPhone: CooperateDTO.contactPhone || contactPhone,
      },
      { where: { id }, returning: true, ...t }
    );
  }

  async remove(id, t = undefined) {
    debugLog(`deleting the auth code with id ${id}`);
    return models.Cooperate.destroy({
      where: { id },
      t,
    });
  }
}

export default CooperateService.getInstance();
