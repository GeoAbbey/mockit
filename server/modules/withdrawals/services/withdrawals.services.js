import debug from "debug";
import models from "../../../models";
import axios from "axios";

const debugLog = debug("app:withdrawals-service");

import { payStack } from "../../../utils/paymentService";
import 

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
    debugLog(`creating a withdrawal for user with id ${withdrawDTO.id}`);
    // get recipient
    // call payStack
    // save transaction on the DB



    '{ "source": "balance", "reason": "Calm down", 
      "amount":3794800, "recipient": "RCP_gx2wn530m0i3w3m"
    }'
    return models.Withdrawal.create(withdrawalDTO);
  }

  async find(id) {
    debugLog(`retrieving Withdrawal with ${id}`);
    return models.Withdrawal.findByPk(id);
  }

  async update(id, WithdrawalDTO, oldWithdrawal) {
    const { description, account_number, bank_code } = oldWithdrawal;

    return models.Withdrawal.update(
      {
        description: WithdrawalDTO.description || description,
        account_number: WithdrawalDTO.account_number || account_number,
        bank_code: WithdrawalDTO.bank_code || bank_code,
      },
      { where: { id }, returning: true, ...t }
    );
  }

  async findMany() {
    return payment.getBankCodes();
  }

  async delete(id, oldWithdrawal) {
    const result = await payment.deleteWithdrawal(oldWithdrawal.code);
    if (result.success === false) return null;
    else
      return models.Withdrawal.destroy({
        where: { id },
      });
  }
}

export default WithdrawalsService.getInstance();
