import debug from "debug";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA } from "../../constants";

import {
  sendNotificationToLawyers,
  sendNotificationToUserOrLawyer,
  layerMarkInterestOrUpdateStatusForClaim,
} from "./helpers";
const logger = debug("app:handlers:listeners:small-claim-events");

import RecipientsService from "../../modules/recipient/services/recipient.services";
import PayoutsController from "../../modules/payout/controllers/payout.controller";

import { schedule } from "../../jobs/scheduler";

const getAmount = PayoutsController.getAmount;

export const smallClaimEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED, (data, decodedToken) => {
    sendNotificationToLawyers(
      EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED,
      data,
      decodedToken,
      "SMALL_CLAIM",
      "CREATED"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, async (data, decodedToken) => {
    
    layerMarkInterestOrUpdateStatusForClaim(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST,
      data,
      decodedToken,
      "MARK_INTEREST",
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.ASSIGNED, async (data, decodedToken) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.SMALL_CLAIM.ASSIGNED,
      data,
      decodedToken,
      "SMALL_CLAIM",
      "ASSIGNED",
      "assignedLawyerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_COMPLETED, async (claim, decodedToken) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_COMPLETED,
      claim,
      decodedToken,
      "SMALL_CLAIM",
      "MARK_AS_COMPLETED",
      "ownerId"
    );

    const {
      dataValues: { assignedLawyerId, id, ownerId },
    } = claim;

    const lawyerRecipientDetails = await RecipientsService.find(assignedLawyerId);

    const data = {
      recipient: lawyerRecipientDetails.dataValues.code,
      reason: JSON.stringify({
        modelType: "smallClaim",
        modelId: id,
        text: "payment made from mark as complete",
        id: ownerId,
        lawyerId: assignedLawyerId,
      }),
      amount: await getAmount("smallClaim", id),
    };

    await schedule.createPayout(data);
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_IN_PROGRESS, async (data, decodedToken) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_IN_PROGRESS,
      data,
      decodedToken,
      "SMALL_CLAIM",
      "MARK_AS_IN_PROGRESS",
      "ownerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.PAID, async (data, decodedToken) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.SMALL_CLAIM.PAID,
      data,
      decodedToken,
      "SMALL_CLAIM",
      "PAID",
      "ownerId"
    );
  });
};
