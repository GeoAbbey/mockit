import { nanoid } from "nanoid";
import debug from "debug";
import InvitationsService from "../../invitations/service/invitations.service";
import SmallClaimsService from "../../small-claims/services/small-claims.service";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";

const config = configOptions[env];
const logger = debug("app:modules:payment:controllers:helpers");

const common = (args) => ({
  customerEmail: args.email,
  contractCode: config.payment_contract_code,
  currencyCode: "NGN",
  customerName: `${args.firstName} ${args.lastName}`,
  paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
  redirectUrl: args.callback_url,
  monnifyToken: args.monnifyToken,
  paymentReference: `ARC-${nanoid(12)}`,
});

export const walletPay = (args) => {
  logger("composing input for wallet initialization");

  if (!args.amount)
    return { success: false, message: "amount to be loaded into wallet is required" };

  return {
    ...common(args),
    amount: args.amount,
    paymentDescription: JSON.stringify({ id: args.id, type: args.type }),
  };
};

export const subscriptionPay = (args) => {
  if (!args.quantity)
    return { success: false, message: "Quantity of subscription to be purchased is required" };

  return {
    ...common(args),
    paymentDescription: JSON.stringify({ id: args.id, type: args.type }),
    amount: args.quantity * parseInt(config.costOfSubscriptionUnit),
  };
};

export const singleInvitationPay = async (args) => {
  logger("composing input for singleInvitationPay initialization");

  if (!args.modelId)
    return { success: false, message: "invitation modelId is required to prosecute payment" };

  const oldInvitation = await InvitationsService.find(args.modelId, null);

  if (oldInvitation.dataValues.paid) {
    return {
      message: "this item has already been paid for",
      success: false,
    };
  }

  return {
    ...common(args),
    amount: config.invitationCost,
    paymentDescription: JSON.stringify({ id: args.id, type: args.type, modelId: args.modelId }),
  };
};

export const singleSmallClaimPay = async (args) => {
  if (!args.modelId)
    return { success: false, message: "small claim modelId is required to prosecute payment" };

  if (!args.lawyerId)
    return { success: false, message: "ID of interested lawyer is required to prosecute payment" };

  const oldClaim = await SmallClaimsService.find(args.modelId, true);

  if (oldClaim.dataValues.paid) {
    return {
      message: "this item has already been paid for",
      success: false,
    };
  }

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

  return {
    ...common(args),
    amount: totalCostOfService,
    paymentDescription: JSON.stringify({
      id: args.id,
      type: args.type,
      modelId: args.modelId,
      assignedLawyerId: args.lawyerId,
    }),
  };
};
