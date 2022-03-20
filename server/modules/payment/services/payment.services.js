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
import PayOutServices from "../../payout/services/payout.services";
import PayoutsController from "../../payout/controllers/payout.controller";
import userService from "../../users/service/user.service";
import { eventEmitter } from "../../../loaders/events";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";
import { EVENT_IDENTIFIERS } from "../../../constants";

const config = configOptions[env];
const getAmount = PayoutsController.getAmount;

const debugLog = debug("app:payment-service");

class PaymentsService {
  static instance;
  static getInstance() {
    if (!PaymentsService.instance) {
      PaymentsService.instance = new PaymentsService();
    }
    return PaymentsService.instance;
  }

  oneTimeFee = async ({ oldAccountInfo, lawyerInfo }) => {
    console.log("I was here 🥶🥁");
    try {
      let result = await models.sequelize.transaction(async (t) => {
        const [, [newAccountInfo]] = await AccountInfosService.update(
          oldAccountInfo.dataValues.id,
          {
            wallet: {
              info: true,
              operation: "deduct",
            },
            walletAmount: parseInt(config.oneTimeFee),
          },
          oldAccountInfo,
          { transaction: t }
        );

        const receipt = await TransactionService.create(
          {
            ownerId: lawyerInfo.id,
            notes: "one time fee",
            amount: config.oneTimeFee,
          },
          { transaction: t }
        );

        const [, [subbed]] = await userService.update(
          lawyerInfo.id,
          { lawyer: { isSubscribed: true } },
          lawyerInfo,
          { transaction: t }
        );

        eventEmitter.emit(EVENT_IDENTIFIERS.ONE_TIME_SUBSCRIPTION_FEE.AUTHORIZED, { lawyerInfo });
      });
    } catch (error) {
      console.log({ error }, "🐒");
      return error;
    }
  };

  async initializePayout(theModel) {
    debugLog(
      `Initializing payment for User with ID ${theModel.assignedLawyerId} for ${theModel.type} with ID of ${theModel.id}`
    );
    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldAccountInfo = await AccountInfosService.find(theModel.assignedLawyerId, {
          transaction: t,
        });

        const [, [newAccountInfo]] = await AccountInfosService.update(
          oldAccountInfo.dataValues.id,
          {
            bookBalance: {
              info: true,
              operation: "add",
            },
            pendingAmount: await getAmount(theModel.type, theModel.id),
          },
          oldAccountInfo,
          { transaction: t }
        );

        const thePayout = await PayOutServices.create({
          ownerId: theModel.assignedLawyerId,
          modelType: theModel.type,
          modelId: theModel.id,
          ticketId: theModel.ticketId,
          amount: await getAmount(theModel.type, theModel.id),
        });

        return {
          success: true,
          message: `Payment has been successfully initialized.`,
        };
      });
      return result;
    } catch (error) {
      console.log({ error }, "🐒");
      return error;
    }
  }

  async completePayout({ theModel, lawyerInfo }) {
    debugLog(
      `Completing payment for User with ID ${theModel.assignedLawyerId} for ${theModel.type} with ID of ${theModel.id}`
    );
    const oldAccountInfo = await AccountInfosService.find(theModel.assignedLawyerId);

    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldPayout = await PayOutServices.findOne({
          ownerId: theModel.assignedLawyerId,
          modelType: theModel.type,
          modelId: theModel.id,
          ticketId: theModel.ticketId,
        });

        const [, [newAccountInfo]] = await AccountInfosService.update(
          oldAccountInfo.dataValues.id,
          {
            bookBalance: {
              info: true,
              operation: "deduct",
            },
            wallet: {
              info: true,
              operation: "add",
            },
            pendingAmount: oldPayout.dataValues.amount,
            walletAmount: oldPayout.dataValues.amount,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const thePayout = await PayOutServices.update(
          oldPayout.dataValues.id,
          { status: "completed" },
          oldPayout.dataValues
        );

        // check if lawyer has paid for one time subscription fee
        !lawyerInfo.lawyer.isSubscribed &&
          this.oneTimeFee({ oldAccountInfo: newAccountInfo, lawyerInfo });

        return {
          success: true,
          message: `Payment has been successfully completed.`,
        };
      });

      return result;
    } catch (error) {
      console.log({ error }, "🐒");
      return error;
    }
  }

  async payInHistory(filter, pageDetails) {
    debugLog("retrieving the payIn history with the following filter", JSON.stringify(filter));
    return PayInServices.findMany(filter, pageDetails);
  }

  async priceList() {
    debugLog("getting the price of all services on the platform");
    return {
      invitationCost: config.invitationCost,
      costOfSubscriptionUnit: config.costOfSubscriptionUnit,
    };
  }

  async create(PaymentDTO, eventEmitter, decodedToken) {
    debugLog("creating a payment");
    const mapper = {
      invitation: this.handleInvitation,
      response: this.handleResponse,
      smallClaim: this.handleSmallClaim,
      cooperate: this.handleCooperateTransfer,
      subscriptionCount: this.handleSubscriptionCount,
    };

    if (PaymentDTO.code) return this.handleCooperate(PaymentDTO, eventEmitter, decodedToken);
    return mapper[PaymentDTO.modelType](PaymentDTO, eventEmitter, decodedToken);
  }

  async processPayIn({ data, eventEmitter, decodedToken }) {
    debugLog("processing a payment");

    const mapper = {
      subscription: this.handleSubscriptionPayIn,
      singleSmallClaim: this.handleSingleSmallClaim,
      singleInvitation: this.handleSingleInvitation,
      wallet: this.handleWalletPayIn,
      cooperate: this.handleCooperatePayIn,
    };

    return mapper[data.metaData.type]({ data, eventEmitter, decodedToken });
  }

  async handleSingleInvitation({ data, eventEmitter, decodedToken }) {
    debugLog("processing a payment handleSingleInvitation");
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metaData: metadata, amountPaid: amount, transactionReference: reference } = data;
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
          amount: parseFloat(amount),
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if card credentials doesn't exist save it.
      const { cardDetails } = data;
      console.log({ cardDetails });

      if (cardDetails && cardDetails.cardToken) {
        const [authDetails, created] = await AuthCodeServices.findOrCreate({
          where: { ownerId: metadata.id, last4: cardDetails.last4 },
          defaults: {
            last4: cardDetails.last4,
            authorizationCode: cardDetails.cardToken,
            cardDetails,
          },
          transaction: t,
        });

        if (!created) {
          await AuthCodeServices.update(
            authDetails.id,
            { cardDetails, authorizationCode: cardDetails.cardToken },
            authDetails.cardDetails,
            { transaction: t }
          );
        }
      }

      eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.CREATED, {
        invitation: paidInvitation,
        decodedToken,
      });

      return { success: true, service: paidInvitation };
    });

    return result;
  }
  async handleSingleSmallClaim({ data, eventEmitter, decodedToken }) {
    debugLog("processing a payment handleSingleSmallClaim");

    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metaData: metadata, amountPaid: amount, transactionReference: reference } = data;

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
        { paid: true, assignedLawyerId: metadata.assignedLawyerId },
        oldClaim,
        { transaction: t }
      );

      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount: parseFloat(amount),
          reference,
          ownerId: metadata.id,
          modelId: metadata.modelId,
        },
        { transaction: t }
      );

      //TODO
      //if card credentials doesn't exist save it.
      const { cardDetails } = data;
      console.log({ cardDetails });

      if (cardDetails && cardDetails.cardToken) {
        const [authDetails, created] = await AuthCodeServices.findOrCreate({
          where: { ownerId: metadata.id, last4: cardDetails.last4 },
          defaults: {
            last4: cardDetails.last4,
            authorizationCode: cardDetails.cardToken,
            cardDetails,
          },
          transaction: t,
        });

        if (!created) {
          await AuthCodeServices.update(
            authDetails.id,
            { cardDetails, authorizationCode: cardDetails.cardToken },
            authDetails.cardDetails,
            { transaction: t }
          );
        }
      }
      eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.PAID, paidSmallClaim, decodedToken);

      return { success: true, service: paidSmallClaim };
    });

    return result;
  }

  async handleWalletPayIn({ data }) {
    debugLog("processing a payment handleWalletPayIn");

    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metaData: metadata, amountPaid: amount, transactionReference: reference } = data;

      const referenceIsAlreadyUsed = await PayInServices.find(reference, metadata.id, {
        transaction: t,
      });

      if (referenceIsAlreadyUsed) {
        return {
          message: `you account has already been credited with the supplied reference ${reference}`,
          success: false,
        };
      }

      const oldAccountInfo = await AccountInfosService.find(metadata.id, {
        transaction: t,
      });

      const [, [newAccountInfo]] = await AccountInfosService.update(
        metadata.id,
        {
          wallet: {
            info: true,
            operation: "add",
          },
          walletAmount: Number(amount),
        },
        oldAccountInfo,
        { transaction: t }
      );
      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount: Number(amount),
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if card credentials doesn't exist save it.
      const { cardDetails } = data;
      console.log({ cardDetails });

      if (cardDetails && cardDetails.cardToken) {
        const [authDetails, created] = await AuthCodeServices.findOrCreate({
          where: { ownerId: metadata.id, last4: cardDetails.last4 },
          defaults: {
            authorizationCode: cardDetails.cardToken,
            last4: cardDetails.last4,
            cardDetails,
          },
          transaction: t,
        });

        if (!created) {
          await AuthCodeServices.update(
            authDetails.id,
            { cardDetails, authorizationCode: cardDetails.cardToken },
            authDetails.cardDetails,
            { transaction: t }
          );
        }
      }

      return { success: true, service: newAccountInfo };
    });

    return result;
  }

  async handleCooperatePayIn({ data }) {
    debugLog("processing a payment handleWalletPayIn");
    // ...to do implement services
    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metaData: metadata, amountPaid: amount, transactionReference: reference } = data;

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
          walletAmount: Number(amount),
        },
        oldCooperateInfo,
        { transaction: t }
      );
      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount: Number(amount),
          reference,
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if card credentials doesn't exist save it.
      const { cardDetails } = data;
      console.log({ cardDetails });

      if (cardDetails && cardDetails.cardToken) {
        const [authDetails, created] = await AuthCodeServices.findOrCreate({
          where: { ownerId: metadata.id, last4: cardDetails.last4 },
          defaults: {
            last4: cardDetails.last4,
            authorizationCode: cardDetails.cardToken,
            cardDetails,
          },
          transaction: t,
        });

        if (!created) {
          await AuthCodeServices.update(
            authDetails.id,
            { cardDetails, authorizationCode: cardDetails.cardToken },
            authDetails.cardDetails,
            { transaction: t }
          );
        }
      }

      return { success: true, service: newCooperateInfo };
    });

    return result;
  }

  async handleSubscriptionPayIn({ data }) {
    debugLog("processing a payment handleSubscriptionPayIn");

    let result = await models.sequelize.transaction(async (t) => {
      // increase the unit of the subscription purchased
      const { metaData: metadata, amountPaid: amount, transactionReference: reference } = data;

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
          subscription: {
            info: true,
            operation: "add",
          },
          subscriptionCount: parseInt(Number(amount) / parseInt(config.costOfSubscriptionUnit)),
        },
        oldAccountInfo,
        { transaction: t }
      );
      //create a pay-in record that captures this payIn
      const receipt = await PayInServices.create(
        {
          for: metadata.type,
          amount: Number(amount),
          reference,
          subQuantity: {
            count: parseInt(amount / parseInt(config.costOfSubscriptionUnit)),
            pricePerCount: config.costOfSubscriptionUnit,
          },
          ownerId: metadata.id,
        },
        { transaction: t }
      );

      //TODO
      //if card credentials doesn't exist save it.
      const { cardDetails } = data;
      console.log({ cardDetails });

      if (cardDetails && cardDetails.cardToken) {
        const [authDetails, created] = await AuthCodeServices.findOrCreate({
          where: { ownerId: metadata.id, last4: cardDetails.last4 },
          defaults: {
            last4: cardDetails.last4,
            authorizationCode: cardDetails.cardToken,
            cardDetails,
          },
          transaction: t,
        });

        if (!created) {
          await AuthCodeServices.update(
            authDetails.id,
            { cardDetails, authorizationCode: cardDetails.cardToken },
            authDetails.cardDetails,
            { transaction: t }
          );
        }
      }

      return { success: true, service: newAccountInfo };
    });

    return result;
  }

  async handleCooperate(args, emitter, decodedToken) {
    //get the cooperate account and the check the access.
    const oldCooperateInfo = await CooperateService.findOne(args.code);

    if (!oldCooperateInfo)
      return {
        message: `The cooperate code ${args.code} is invalid`,
        success: false,
      };

    const hasAccess = await CooperateAccessService.findOne({
      userAccessId: decodedToken.id,
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

        const lawyerId = args.lawyerId;
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
          { paid: true, assignedLawyerId: lawyerId },
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
      console.log({ error }, "🐒");
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

        if (oldCooperateInfo.walletAmount < config.invitationCost) {
          return {
            message: "you do not have sufficient funds to prosecute this transaction",
            success: false,
          };
        }

        const newCooperateInfo = await CooperateService.update(
          oldCooperateInfo.dataValues.id,
          {
            operation: "deduct",
            walletAmount: config.invitationCost,
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
            amount: config.invitationCost,
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
      console.log({ error }, "🐒");
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

        debugLog({
          oldAccountInfo: oldAccountInfo.walletAmount,
          invitationCost: config.invitationCost,
        });

        if (oldAccountInfo.walletAmount < config.invitationCost) {
          return {
            message: "you do not have sufficient funds to prosecute this transaction",
            success: false,
          };
        }

        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            wallet: {
              info: true,
              operation: "deduct",
            },
            walletAmount: config.invitationCost,
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
            amount: config.invitationCost,
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
      console.log({ error }, "🐒");
      return error;
    }
  }

  async handleSubscriptionCount(args, emitter, decodedToken) {
    debugLog("Purchasing subscription count from my personal wallet");
    console.log({ args }, "🤯");

    const oldAccountInfo = await AccountInfosService.find(args.id);
    const amount = config.costOfSubscriptionUnit * args.quantity;
    if (amount > oldAccountInfo.dataValues.walletAmount) {
      return {
        success: false,
        message: `Insufficient funds: quantity of ${
          args.quantity
        } is more than available balance of ${oldAccountInfo.dataValues.walletAmount / 100}`,
      };
    }

    try {
      let result = await models.sequelize.transaction(async (t) => {
        //delete from the specified account
        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            wallet: {
              info: true,
              operation: "deduct",
            },
            subscription: {
              info: true,
              operation: "add",
            },
            subscriptionCount: parseInt(args.quantity),
            walletAmount: amount,
          },
          oldAccountInfo,
          { transaction: t }
        );

        //create receipt
        const receipt = await TransactionService.create(
          {
            ownerId: args.id,
            performedBy: args.id,
            modelType: args.modelType,
            notes: `Unit price of ${config.costOfSubscriptionUnit}`,
            amount: amount,
          },
          { transaction: t }
        );

        return {
          success: true,
          message: "Transfer successfully executed",
        };
      });

      return result;
    } catch (error) {
      console.log({ error }, "🐒");
      return error;
    }
  }

  async handleCooperateTransfer(args, emitter, decodedToken) {
    debugLog("Transferring funds from personal wallet to cooperate wallet");

    //find the personal wallet and check that he has above the specified amount
    const oldAccountInfo = await AccountInfosService.find(args.id);
    if (args.amount > oldAccountInfo.dataValues.walletAmount) {
      return {
        success: false,
        message: `Insufficient funds: amount ${args.amount} is more than available balance of ${oldAccountInfo.dataValues.walletAmount}`,
      };
    }

    try {
      let result = await models.sequelize.transaction(async (t) => {
        //delete from the specified account
        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            wallet: {
              info: true,
              operation: "deduct",
            },
            walletAmount: args.amount,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const oldCooperateInfo = await CooperateService.find(args.id);

        //add to the cooperate account
        const newCooperateInfo = await CooperateService.update(
          oldCooperateInfo.dataValues.id,
          {
            operation: "add",
            walletAmount: args.amount,
          },
          oldCooperateInfo,
          { transaction: t }
        );

        //create receipt
        const receipt = await TransactionService.create(
          {
            ownerId: args.id,
            performedBy: args.id,
            modelType: "cooperate",
            amount: args.amount,
          },
          { transaction: t }
        );

        return {
          success: true,
          message: "Transfer successfully executed",
        };
      });

      return result;
    } catch (error) {
      console.log({ error }, "🐒");
      return error;
    }
  }

  async handleSmallClaim(args, emitter, decodedToken) {
    debugLog("handling payment for small claim", args);

    if (!args.lawyerId)
      return {
        success: false,
        message: "ID of interested lawyer is required to prosecute payment",
      };

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

        const lawyerOfInterest = oldClaim.dataValues.interestedLawyers.find(
          (lawyer) => lawyer.lawyerId === args.lawyerId
        );

        if (!lawyerOfInterest)
          return {
            success: false,
            message: "The lawyer selected didn't mark interest in this particular small claim",
          };

        const {
          dataValues: { baseCharge, serviceCharge },
        } = lawyerOfInterest;

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
            wallet: {
              info: true,
              operation: "deduct",
            },
            walletAmount: totalCostOfService,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const [, [paidSmallClaim]] = await SmallClaimsService.update(
          args.modelId,
          { paid: true, assignedLawyerId: args.lawyerId },
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
      console.log({ error }, "🐒");
      return error;
    }
  }

  async returnSubscriptionCount(args) {
    debugLog(`returning subscriptionCount for emergency response to ownerId ${args.id}`, args);
    try {
      let result = await models.sequelize.transaction(async (t) => {
        const oldAccountInfo = await AccountInfosService.find(args.id, { transaction: t });

        const newAccountInfo = await AccountInfosService.update(
          args.id,
          {
            subscription: {
              operation: "add",
              info: true,
            },
            subscriptionCount: 1,
          },
          oldAccountInfo,
          { transaction: t }
        );

        const receipt = await TransactionService.create(
          {
            ownerId: args.id,
            performedBy: args.id,
            modelType: "response",
            notes: "return",
            amount: parseInt(config.costOfSubscriptionUnit),
          },
          { transaction: t }
        );

        return { success: true, service: newAccountInfo };
      });

      return result;
    } catch (error) {
      console.log({ error }, "🐒");
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
            subscription: {
              operation: "deduct",
              info: true,
            },
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
      console.log({ error }, "🐒");
      return error;
    }
  }
}

export default PaymentsService.getInstance();
