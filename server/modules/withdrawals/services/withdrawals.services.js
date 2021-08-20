import debug from "debug";
import models from "../../../models";
import axios from "axios";

const debugLog = debug("app:withdrawals-service");

import { payStack } from "../../../utils/paymentService";
import RecipientServices from "../../recipient/services/recipient.services";
import { toKobo } from "../../../utils/toKobo";
import AccountInfoServices from "../../accountInfo/services/accountInfo.services";
import { exceptionHandler } from "../../../utils/exceptionHandler";
import { paginate } from "../../helpers";

const payment = payStack(axios);

class WithdrawalsService {
  static instance;
  static getInstance() {
    if (!WithdrawalsService.instance) {
      WithdrawalsService.instance = new WithdrawalsService();
    }
    return WithdrawalsService.instance;
  }

  async create(withdrawalDTO) {
    debugLog(`creating a withdrawal for user with id ${withdrawalDTO.id}`);
    const { id, amount, email, name } = withdrawalDTO;
    const theRecipient = await RecipientServices.find(id);

    if (!theRecipient)
      return {
        success: false,
        message: `kindly create a payout account to enable withdrawal`,
      };

    const oldAccountInfo = await AccountInfoServices.find(id);

    if (toKobo(amount) > oldAccountInfo.dataValues.walletAmount) {
      return {
        success: false,
        message: `Insufficient funds: you do not have up to the amount you are trying to withdraw`,
      };
    }

    const data = {
      recipient: theRecipient.dataValues.code,
      source: "balance",
      amount: toKobo(amount),
      reason: JSON.stringify({
        name,
        email,
        id,
      }),
    };

    try {
      return models.sequelize.transaction(async (t) => {
        const newAccountInfo = await AccountInfoServices.update(
          id,
          {
            wallet: {
              info: true,
              operation: "deduct",
            },
            walletAmount: toKobo(amount),
          },
          oldAccountInfo,
          { transaction: t }
        );

        const result = await payment.transfer(data);

        if (!result.success)
          throw new exceptionHandler({
            message: "There was an internal error, kindly try again later",
            status: 503,
          });

        const withdrawal = await models.Withdrawal.create({
          transfer_code: result.response.data.transfer_code,
          data: result.response.data,
          amount: toKobo(amount),
          status: result.response.data.status,
          reference: result.response.data.reference,
          ownerId: id,
        });

        return { success: true, message: `Withdrawal of ${amount} was successful`, withdrawal };
      });
    } catch (error) {
      console.log(error, "🍋");
      return { success: false, error };
    }
  }

  async find(id, paranoid) {
    debugLog(`retrieving Withdrawal with ${id}`);
    return models.Withdrawal.findByPk(id, paranoid);
  }

  async update(id, withdrawalDTO, oldWithdrawal, t = undefined) {
    const result = await payment.finalizeTransfer({
      transfer_code: oldWithdrawal.transfer_code,
      otp: withdrawalDTO.otp,
    });

    if (!result.success)
      throw new exceptionHandler({
        message: "There was an internal error, kindly try again later",
        status: 503,
      });

    return models.Withdrawal.update(
      { status: result.response.data.status, data: result.response.data },
      { where: { id }, returning: true, ...t }
    );
  }

  async findMany(filter, pageDetails, paranoid) {
    debugLog(`retrieving withdrawals with the following filter ${JSON.stringify(filter)}`);
    return models.Withdrawal.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
      ...paginate(pageDetails),
      ...paranoid,
    });
  }

  async delete(id) {
    return models.Withdrawal.destroy({
      where: { id },
    });
  }
}

export default WithdrawalsService.getInstance();
