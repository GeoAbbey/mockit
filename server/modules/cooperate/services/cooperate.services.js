import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:cooperate-service");

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

  async findOne(code) {
    debugLog(`looking for cooperate account with code ${code}`);
    return models.Cooperate.findOne({ where: { code } });
  }

  async update(id, CooperateDTO, oldCooperateDInfo, t = undefined) {
    const { walletAmount } = oldCooperateDInfo;

    const handleAmount = (newValue, previousValue, operation) => {
      if (operation === "add") {
        return newValue + previousValue;
      } else return previousValue - newValue;
    };

    return models.Cooperate.update(
      {
        walletAmount: handleAmount(CooperateDTO.walletAmount, walletAmount, CooperateDTO.operation),
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
