import InvitationsService from "../../invitations/service/invitations.service";
import SmallClaimsService from "../../small-claims/services/small-claims.service";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";

const config = configOptions[env];

export const walletPay = (args) => {
  if (!args.amount)
    return { success: false, message: "amount to be loaded into wallet is required" };

  return {
    email: args.email,
    amount: args.amount * 100,
    callback_url: args.callback_url,
    metadata: { id: args.id, type: args.type },
  };
};

export const subscriptionPay = (args) => {
  if (!args.quantity)
    return { success: false, message: "Quantity of subscription to be purchased is required" };

  return {
    email: args.email,
    callback_url: args.callback_url,
    amount: args.quantity * parseInt(config.costOfSubscriptionUnit) * 100,
    metadata: { id: args.id, type: args.type },
  };
};

export const singleInvitationPay = async (args) => {
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
    email: args.email,
    callback_url: args.callback_url,
    amount: parseInt(config.invitationCost) * 100,
    metadata: { id: args.id, type: args.type, modelId: args.modelId },
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
    email: args.email,
    callback_url: args.callback_url,
    amount: totalCostOfService,
    metadata: {
      id: args.id,
      type: args.type,
      modelId: args.modelId,
      assignedLawyerId: args.lawyerId,
    },
  };
};
