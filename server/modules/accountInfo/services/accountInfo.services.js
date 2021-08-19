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

  async update(id, AccountInfoDTO, oldAccountInfo, t = undefined) {
    const { walletAmount, subscriptionCount, pendingAmount } = oldAccountInfo;

    const handleAmount = (newValue, previousValue, operation) => {
      if (operation === "add") {
        return newValue + previousValue;
      } else {
        console.log("I was called 🥜");
        const result = previousValue - newValue;
        console.log({ result, previousValue, newValue }, "🌰");
        return result;
      }
    };

    return models.AccountInfo.update(
      {
        pendingAmount:
          AccountInfoDTO.bookBalance && AccountInfoDTO.bookBalance.info
            ? handleAmount(
                AccountInfoDTO.pendingAmount,
                pendingAmount,
                AccountInfoDTO.bookBalance.operation
              )
            : pendingAmount,
        walletAmount:
          AccountInfoDTO.wallet && AccountInfoDTO.wallet.info
            ? handleAmount(
                AccountInfoDTO.walletAmount,
                walletAmount,
                AccountInfoDTO.wallet.operation
              )
            : walletAmount,
        subscriptionCount:
          AccountInfoDTO.subscription && AccountInfoDTO.subscription.info
            ? handleAmount(
                AccountInfoDTO.subscriptionCount,
                subscriptionCount,
                AccountInfoDTO.subscription.operation
              )
            : subscriptionCount,
      },
      { where: { id }, returning: true, ...t }
    );
  }
}

export default AccountInfosService.getInstance();
