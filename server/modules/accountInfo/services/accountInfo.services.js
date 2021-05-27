import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:small-claims-service");

class AccountInfosService {
  static instance;
  static getInstance() {
    if (!AccountInfosService.instance) {
      AccountInfosService.instance = new AccountInfosService();
    }
    return AccountInfosService.instance;
  }

  async create(AccountInfoDTO) {
    debugLog("creating a accountInfo");
    return models.AccountInfo.create(AccountInfoDTO);
  }

  async find(id, t = undefined) {
    debugLog(`looking for an accountInfo with id ${id}`);
    return models.AccountInfo.findByPk(id, t);
  }

  async findMany() {}

  async update(id, AccountInfoDTO, oldAccountInfo, t = undefined) {
    const { walletAmount, subscriptionCount } = oldAccountInfo;

    const handleAmount = (newValue, previousValue, operation) => {
      if (operation === "add") {
        return newValue + previousValue;
      } else return previousValue - newValue;
    };

    return models.AccountInfo.update(
      {
        walletAmount:
          AccountInfoDTO.info === "wallet"
            ? handleAmount(AccountInfoDTO.walletAmount, walletAmount, AccountInfoDTO.operation)
            : walletAmount,
        subscriptionCount:
          AccountInfoDTO.info === "subscription"
            ? handleAmount(
                AccountInfoDTO.subscriptionCount,
                subscriptionCount,
                AccountInfoDTO.operation
              )
            : subscriptionCount,
      },
      { where: { id }, returning: true },
      t
    );
  }
}

export default AccountInfosService.getInstance();
