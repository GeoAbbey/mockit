import debug from "debug";
import models from "../../../models";

import InvitationsService from "../../invitations/service/invitations.service";
import AccountInfosService from "../../accountInfo/services/accountInfo.services";
import TransactionService from "../../transactions/services/transaction.services";
import SmallClaimsService from "../../small-claims/services/small-claims.service";
import ResponsesService from "../../response/services/response.services";
import PayInServices from "../../payIn/services/pay-in.services";
import AuthCodeServices from "../../authCode/services/auth-code.services";
import CooperateService from "../../cooperate/services/cooperate.services";
import CooperateAccessService from "../../cooperateAccess/services/cooperate-access.services";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";
import { EVENT_IDENTIFIERS } from "../../../constants";
import { toKobo } from "../../../utils/toKobo";

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

  async payInHistory(id){
    return PayInServices.findMany(id);
  }


  async create(PaymentDTO, eventEmitter, decodedToken) {
    debugLog("creating a payment");
    const mapper = {
      invitation: this.handleInvitation,
      response: this.handleResponse,
      smallClaim: this.handleSmallClaim,
    };

    if (PaymentDTO.code) return this.handleCooperate(PaymentDTO, eventEmitter, decodedToken);
    return mapper[PaymentDTO.modelType](PaymentDTO, eventEmitter, decodedToken);
  }

  async processPayIn({ data, eventEmitter, decodedToken }) {
    const mapper = {
      subscription: this.handleSubscriptionPayIn,
      singleSmallClaim: this.handleSingleSmallClaim,
      singleInvitation: this.handleSingleInvitation,
      wallet: this.handleWalletPayIn,
      cooperate: this.handleCooperatePayIn,
    };

    return mapper[data.metadata.type]({ data, eventEmitter, decodedToken });
  }

  async handleSingleInvitation({ data, eventEmitter, decodedToken }) {
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metadata, amount, reference } = data;
      const referenceIsAlreadyUsed = await PayInServices.find(reference, metadata.id, {
        transaction: t,
      });
      if (referenceIsAlreadyUsed) {
        return {
          message: `you account has already been credited with the supplied reference ${reference}`,
          success: false,
        };
      }

      const oldInvitation = await InvitationsService.find(metadata.modelId, null, {
        transaction: t,
      });

      if (oldInvitation.dataValues.paid) {
        return {
          message: "this item has already been paid for",
          success: false,
        };
      }

      const [, [paidInvitation]] = await InvitationsService.update(
        metadata.modelId,
        { paid: true },
        oldInvitation,
        { transaction: t }
      );

      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount,
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if can credentials doesn't exist save it.
      const { authorization } = data;
      console.log({ authorization });

      const authDetails = await AuthCodeServices.findOrCreate({
        where: { ownerId: metadata.id, authorizationCode: authorization.authorization_code },
        defaults: {
          last4: authorization.last4,
          cardDetails: authorization,
        },
        transaction: t,
      });

      eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.CREATED, {
        invitation: paidInvitation,
        decodedToken,
      });

      return { success: true, service: paidInvitation };
    });

    return result;
  }
  async handleSingleSmallClaim({ data }) {
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metadata, amount, reference } = data;
      const referenceIsAlreadyUsed = await PayInServices.find(reference, metadata.id, {
        transaction: t,
      });
      if (referenceIsAlreadyUsed) {
        return {
          message: `you account has already been credited with the supplied reference ${reference}`,
          success: false,
        };
      }

      const oldClaim = await SmallClaimsService.find(metadata.modelId, null, { transaction: t });

      if (oldClaim.dataValues.paid) {
        return {
          message: "this item has already been paid for",
          success: false,
        };
      }

      const [, [paidSmallClaim]] = await SmallClaimsService.update(
        metadata.modelId,
        { paid: true },
        oldClaim,
        { transaction: t }
      );

      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount,
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if can credentials doesn't exist save it.
      const { authorization } = data;
      const authDetails = await AuthCodeServices.findOrCreate(
        {
          where: { ownerId: metadata.id, authorizationCode: authorization.authorization_code },
          defaults: {
            last4: authorization.last4,
            cardDetails: authorization,
          },
        },
        { transaction: t }
      );
      return { success: true, service: paidSmallClaim };
    });

    return result;
  }

  async handleWalletPayIn({ data }) {
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metadata, amount, reference } = data;
      const referenceIsAlreadyUsed = await PayInServices.find(reference, metadata.id, {
        transaction: t,
      });
      if (referenceIsAlreadyUsed) {
        return {
          message: `you account has already been credited with the supplied reference ${reference}`,
          success: false,
        };
      }

      const oldAccountInfo = await AccountInfosService.find(metadata.id, { transaction: t });
      const [, [newAccountInfo]] = await AccountInfosService.update(
        metadata.id,
        {
          info: "wallet",
          operation: "add",
          walletAmount: amount,
        },
        oldAccountInfo,
        { transaction: t }
      );
      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount,
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if can credentials doesn't exist save it.
      const { authorization } = data;
      const authDetails = await AuthCodeServices.findOrCreate(
        {
          where: { ownerId: metadata.id, authorizationCode: authorization.authorization_code },
          defaults: {
            last4: authorization.last4,
            cardDetails: authorization,
          },
        },
        { transaction: t }
      );

      return { success: true, service: newAccountInfo };
    });

    return result;
  }

  async handleCooperatePayIn({ data }) {
    // ...to do implement services
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metadata, amount, reference } = data;
      console.log({ data }, "💰");
      const referenceIsAlreadyUsed = await PayInServices.find(reference, metadata.id, {
        transaction: t,
      });
      if (referenceIsAlreadyUsed) {
        return {
          message: `you account has already been credited with the supplied reference ${reference}`,
          success: false,
        };
      }

      const oldCooperateInfo = await CooperateService.find(metadata.id, { transaction: t });
      console.log({ oldCooperateInfo }, "🍋");
      const [, [newCooperateInfo]] = await CooperateService.update(
        metadata.id,
        {
          operation: "add",
          walletAmount: amount,
        },
        oldCooperateInfo,
        { transaction: t }
      );
      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount,
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if can credentials doesn't exist save it.
      const { authorization } = data;
      const authDetails = await AuthCodeServices.findOrCreate(
        {
          where: { ownerId: metadata.id, authorizationCode: authorization.authorization_code },
          defaults: {
            last4: authorization.last4,
            cardDetails: authorization,
          },
        },
        { transaction: t }
      );

      return { success: true, service: newCooperateInfo };
    });

    return result;
  }

  async handleSubscriptionPayIn({ data }) {
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metadata, amount, reference } = data;
      const referenceIsAlreadyUsed = await PayInServices.find(reference, metadata.id, t);
      if (referenceIsAlreadyUsed) {
        return {
          message: `you account has already been credited with the supplied reference ${reference}`,
          success: false,
        };
      }

      const oldAccountInfo = await AccountInfosService.find(metadata.id, { transaction: t });
      const [, [newAccountInfo]] = await AccountInfosService.update(
        metadata.id,
        {
          info: "subscription",
          operation: "add",
          subscriptionCount: parseInt(amount / 100 / parseInt(config.costOfSubscriptionUnit)),
        },
        oldAccountInfo,
        { transaction: t }
      );
      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount,
          reference,
          subQuantity: {
            count: parseInt(amount / 100 / parseInt(config.costOfSubscriptionUnit)),
            pricePerCount: config.costOfSubscriptionUnit,
          },
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if can credentials doesn't exist save it.
      const { authorization } = data;
      const authDetails = await AuthCodeServices.findOrCreate(
        {
          where: { ownerId: metadata.id, authorizationCode: authorization.authorization_code },
          defaults: {
            last4: authorization.last4,
            cardDetails: authorization,
          },
        },
        { transaction: t }
      );
      return { success: true, service: newAccountInfo };
    });

    return result;
  }

  async handleCooperate(args, emitter, decodedToken) {
    //get the cooporate account and the check the access.
    const oldCooperateInfo = await CooperateService.findOne(args.code);
    console.log({ oldCooperateInfo });

    const hasAccess = await CooperateAccessService.findOne({
      id: decodedToken.id,
      ownerId: oldCooperateInfo.dataValues.id,
    });

    if (!hasAccess)
      return {
        message: "You do not have access to use this cooperate code",
        success: false,
      };

    const mapper = {
      invitation: this.handleInvitationWithCooperate,
      smallClaim: this.handleSmallClaimWithCooperate,
    };

    return mapper[args.modelType](args, emitter, decodedToken);
  }

  async handleSmallClaimWithCooperate(args, emitter, decodedToken) {
    debugLog("I am handling a small claim with a cooperate reference");

    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldClaim = await SmallClaimsService.find(args.modelId, true, { transaction: t });

        if (oldClaim.dataValues.paid) {
          return {
            message: "this item has already been paid for",
            success: false,
          };
        }

        const oldCooperateInfo = await CooperateService.findOne(args.code);

        const lawyerId = oldClaim.dataValues.assignedLawyerId;
        const {
          dataValues: { baseCharge, serviceCharge },
        } = oldClaim.dataValues.interestedLawyers.find((lawyer) => lawyer.lawyerId === lawyerId);

        const totalCostOfService = baseCharge + serviceCharge;

        if (oldCooperateInfo.walletAmount < totalCostOfService) {
          return {
            message: "you do not have sufficient funds to prosecute this transaction",
            success: false,
          };
        }

        const newCooperateInfo = await CooperateService.update(
          oldCooperateInfo.dataValues.id,
          {
            operation: "deduct",
            walletAmount: totalCostOfService,
          },
          oldCooperateInfo,
          { transaction: t }
        );

        const [, [paidClaim]] = await SmallClaimsService.update(
          args.modelId,
          { paid: true },
          oldClaim,
          { transaction: t }
        );

        const receipt = await TransactionService.create(
          {
            code: args.code,
            ownerId: args.id,
            performedBy: args.id,
            modelType: "smallClaim",
            modelId: args.modelId,
            amount: totalCostOfService,
          },
          { transaction: t }
        );

        emitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.PAID, paidClaim, decodedToken);

        return { success: true, service: paidClaim };
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  async handleInvitationWithCooperate(args, emitter, decodedToken) {
    debugLog("I am handling a police invitation with a cooperate reference");

    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldInvitation = await InvitationsService.find(args.modelId, null, { transaction: t });

        if (oldInvitation.dataValues.paid) {
          return {
            message: "this item has already been paid for",
            success: false,
          };
        }
        const oldCooperateInfo = await CooperateService.findOne(args.code);

        if (oldCooperateInfo.walletAmount < toKobo(config.invitationCost)) {
          return {
            message: "you do not have sufficient funds to prosecute this transaction",
            success: false,
          };
        }

        const newCooperateInfo = await CooperateService.update(
          oldCooperateInfo.dataValues.id,
          {
            operation: "deduct",
            walletAmount: toKobo(config.invitationCost),
          },
          oldCooperateInfo,
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
            code: args.code,
            ownerId: args.id,
            performedBy: args.id,
            modelType: "invitation",
            modelId: args.modelId,
            amount: toKobo(config.invitationCost),
          },
          { transaction: t }
        );

        emitter.emit(EVENT_IDENTIFIERS.INVITATION.CREATED, {
          invitation: paidInvitation,
          decodedToken,
        });
        return { success: true, service: paidInvitation };
      });

      return result;
    } catch (error) {
      return error;
    }
  }
  async handleInvitation(args, emitter, decodedToken) {
    debugLog("I am handling payment for invitations", args);
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
        console.log({
          oldAccountInfo: oldAccountInfo.walletAmount,
          invitationCost: config.invitationCost * 100,
        });

        if (oldAccountInfo.walletAmount < toKobo(config.invitationCost)) {
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
            walletAmount: toKobo(config.invitationCost),
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
            amount: toKobo(config.invitationCost),
          },
          { transaction: t }
        );

        emitter.emit(EVENT_IDENTIFIERS.INVITATION.CREATED, {
          invitation: paidInvitation,
          decodedToken,
        });

        return { success: true, service: paidInvitation };
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  async handleSmallClaim(args, emitter, decodedToken) {
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

        emitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.PAID, paidSmallClaim, decodedToken);

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
