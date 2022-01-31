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

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";
import { nanoid } from "nanoid";

const config = configOptions[env];

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
    const { id, amount, email, name, accountCode } = withdrawalDTO;
    const theRecipient = await RecipientServices.findByCode({ lawyerId: id, code: accountCode });

    if (!theRecipient)
      return {
        success: false,
        message: `kindly create a payout account to enable withdrawal`,
      };

    const oldAccountInfo = await AccountInfoServices.find(id);

    if (amount > oldAccountInfo.dataValues.walletAmount) {
      return {
        success: false,
        message: `Insufficient funds: you do not have up to the amount you are trying to withdraw`,
      };
    }

    try {
      return models.sequelize.transaction(async (t) => {
        const newAccountInfo = await AccountInfoServices.update(
          id,
          {
            wallet: {
              info: true,
              operation: "deduct",
            },
            walletAmount: amount,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const withdrawal = await models.Withdrawal.create({
          amount,
          status: "INITIATED",
          reference: nanoid(15),
          accountID: theRecipient.code,
          data: { email, name },
          ownerId: id,
        });

        return {
          success: true,
          message: `Withdrawal of ${amount} was successful initiated, you will be paid when an account officer verifies this transaction`,
          withdrawal,
        };
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

  async update({ id, adminId, oldWithdrawal, monnifyToken, t = undefined }) {
    const theRecipient = await RecipientServices.findByCode({
      lawyerId: oldWithdrawal.ownerId,
      code: oldWithdrawal.accountID,
    });

    console.log({ theRecipient: theRecipient.details }, "⏰");

    const data = {
      monnifyToken,
      amount: oldWithdrawal.amount,
      reference: oldWithdrawal.reference,
      narration: `payment initiated by lawyer with id-${oldWithdrawal.ownerId} email-${oldWithdrawal.data.email} name-${oldWithdrawal.data.name}`,
      destinationBankCode: theRecipient.details.bankCode,
      destinationAccountNumber: theRecipient.details.accountNumber,
      currency: "NGN",
      sourceAccountNumber: config.payment_source_account_number,
    };

    try {
      return models.sequelize.transaction(async (t) => {
        const result = await payment.disbursements(data);

        if (!result.success)
          throw new exceptionHandler({
            message: result.response,
            status: 503,
          });

        return models.Withdrawal.update(
          {
            status: result.response.responseBody.status,
            data: result.response.responseBody,
            approvedBy: adminId,
          },
          { where: { id }, returning: true, ...t }
        );
      });
    } catch (error) {
      console.log(error, "🍋");
      return { success: false, error };
    }
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
