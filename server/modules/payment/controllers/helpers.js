import { nanoid } from "nanoid";
import debug from "debug";
import InvitationsService from "../../invitations/service/invitations.service";
import SmallClaimsService from "../../small-claims/services/small-claims.service";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";
import milestoneService from "../../mileStone/service/milestone.service";
import interestedLawyersServices from "../../interestedLawyers/services/interestedLawyers.services";

const config = configOptions[env];
const logger = debug("app:modules:payment:controllers:helpers");

const common = (args) => ({
  customerEmail: args.email,
  contractCode: config.payment_contract_code,
  currencyCode: "NGN",
  customerName: `${args.firstName} ${args.lastName}`,
  paymentMethods: ["CARD"],
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
    metaData: { id: args.id, type: args.type },
    paymentDescription: `amount of ${args.amount} to be added to ${args.type} by user ${args.id}`,
  };
};

export const subscriptionPay = (args) => {
  if (!args.quantity)
    return { success: false, message: "Quantity of subscription to be purchased is required" };

  return {
    ...common(args),
    metaData: { id: args.id, type: args.type },
    amount: args.quantity * parseInt(config.costOfSubscriptionUnit),
    paymentDescription: `${args.quantity} of subscription has been purchased by user ${args.id}`,
  };
};

export const mileStonePay = async (args) => {
  if (!args.modelId) return { success: false, message: "modelId is required to prosecute payment" };

  const theMileStone = await milestoneService.find(args.modelId);
  if (!theMileStone) return { success: false, message: "mile stone can not be found" };

  const { lawyerId, claimId, percentage } = theMileStone;

  const { serviceCharge } = await interestedLawyersServices.findOne({ lawyerId, modelId: claimId });

  const amountToPay =
    ((serviceCharge + (config.administrationPercentage / 100) * serviceCharge) *
      parseInt(percentage)) /
    100;

  console.log({ amountToPay });

  return {
    ...common(args),
    metaData: { id: args.id, type: args.type, modelId: args.modelId },
    amount: amountToPay,
    paymentDescription: `of subscription has been purchased by user ${args.id}`,
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
    paymentDescription: `amount of ${config.invitationCost} is paid for single invitation with ${args.modelId} by user ${args.id}`,
    metaData: { id: args.id, type: args.type, modelId: args.modelId },
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

  return {
    ...common(args),
    amount: config.consultationFee,
    paymentDescription: `amount of ${config.consultationFee} is paid for single small claim with ${args.modelId} by user ${args.id}`,
    metaData: {
      id: args.id,
      type: args.type,
      modelId: args.modelId,
      assignedLawyerId: args.lawyerId,
    },
  };
};
