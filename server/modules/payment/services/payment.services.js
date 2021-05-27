import debug from "debug";
import models from "../../../models";

import InvitationsService from "../../invitations/service/invitations.service";
import AccountInfosService from "../../accountInfo/services/accountInfo.services";
import TransactionService from "../../transactions/services/transaction.services";
import SmallClaimsService from "../../small-claims/services/small-claims.service";
import ResponsesService from "../../response/services/response.services";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";

const config = configOptions[env];

const debugLog = debug("app:payment-service");

class PaymentsService {
  static instance;
  static getInstance() {
    if (!PaymentsService.instance) {
      PaymentsService.instance = new PaymentsService();
    }
    return PaymentsService.instance;
  }

  async create(PaymentDTO) {
    debugLog("creating a payment");
    const mapper = {
      invitation: this.handleInvitation,
      response: this.handleResponse,
      smallClaim: this.handleSmallClaim,
    };

    return mapper[PaymentDTO.modelType](PaymentDTO);
  }

  async handleInvitation(args) {
    console.log("I am handling payment for invitations", args);
    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldInvitation = await InvitationsService.find(args.modelId, null, { transaction: t });

        if (oldInvitation.dataValues.paid) {
          return {
            message: "this item has already been paid for",
            success: false,
          };
        }
        const oldAccountInfo = await AccountInfosService.find(args.id, { transaction: t });

        if (oldAccountInfo.walletAmount < config.invitationCost) {
          return {
            message: "you do not have sufficient funds to prosecute this transaction",
            success: false,
          };
        }

        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            info: "wallet",
            operation: "deduct",
            walletAmount: parseInt(config.invitationCost),
          },
          oldAccountInfo,
          { transaction: t }
        );

        const [, [paidInvitation]] = await InvitationsService.update(
          args.modelId,
          { paid: true },
          oldInvitation,
          { transaction: t }
        );

        const receipt = await TransactionService.create(
          {
            ownerId: args.id,
            performedBy: args.id,
            modelType: "invitation",
            modelId: args.modelId,
            amount: parseInt(config.invitationCost),
          },
          { transaction: t }
        );

        return { success: true, service: paidInvitation };
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  async handleSmallClaim(args) {
    debugLog("handling payment for small claim", args);
    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldClaim = await SmallClaimsService.find(args.modelId, true, { transaction: t });

        if (oldClaim.dataValues.paid) {
          return {
            message: "this item has already been paid for",
            success: false,
          };
        }

        const oldAccountInfo = await AccountInfosService.find(args.id, { transaction: t });

        const lawyerId = oldClaim.dataValues.assignedLawyerId;
        const {
          dataValues: { baseCharge, serviceCharge },
        } = oldClaim.dataValues.interestedLawyers.find((lawyer) => lawyer.lawyerId === lawyerId);

        const totalCostOfService = baseCharge + serviceCharge;

        if (oldAccountInfo.walletAmount < totalCostOfService) {
          return {
            message: "you do not have sufficient funds to prosecute this transaction",
            success: false,
          };
        }

        console.log({ oldClaim });
        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            info: "wallet",
            operation: "deduct",
            walletAmount: totalCostOfService,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const [, [paidSmallClaim]] = await SmallClaimsService.update(
          args.modelId,
          { paid: true },
          oldClaim,
          { transaction: t }
        );

        const receipt = await TransactionService.create(
          {
            ownerId: args.id,
            performedBy: args.id,
            modelType: "smallClaim",
            modelId: args.modelId,
            amount: totalCostOfService,
          },
          { transaction: t }
        );

        return { success: true, service: paidSmallClaim };
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  async handleResponse(args) {
    debugLog("handling payment for emergency response", args);
    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldResponse = await ResponsesService.find(args.modelId, {
          transaction: t,
        });

        if (oldResponse.dataValues.paid) {
          return {
            message: "this item has already been paid for",
            success: false,
          };
        }
        const oldAccountInfo = await AccountInfosService.find(args.id, { transaction: t });

        if (!oldAccountInfo.subscriptionCount) {
          return {
            message: "you do not have sufficient unit to prosecute this transaction",
            success: false,
          };
        }

        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            info: "subscription",
            operation: "deduct",
            subscriptionCount: 1,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const [, [paidResponse]] = await ResponsesService.update(
          args.modelId,
          { paid: true },
          oldResponse,
          { transaction: t }
        );

        const receipt = await TransactionService.create(
          {
            ownerId: args.id,
            performedBy: args.id,
            modelType: "response",
            modelId: args.modelId,
            amount: parseInt(config.costOfSubscriptionUnit),
          },
          { transaction: t }
        );

        return { success: true, service: paidResponse };
      });

      return result;
    } catch (error) {
      return error;
    }
  }
}

export default PaymentsService.getInstance();
