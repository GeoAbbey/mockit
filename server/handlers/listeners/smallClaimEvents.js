import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../constants";
import PaymentsService from "../../modules/payment/services/payment.services";

import {
  sendNotificationToLawyers,
  sendNotificationToUserOrLawyer,
  layerMarkInterestOrUpdateStatusForClaim,
} from "./helpers";
const logger = debug("app:handlers:listeners:small-claim-events");

import { schedule } from "../../jobs/scheduler";

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
      "MARK_INTEREST"
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

    const data = {
      ...claim.dataValues,
      type: "smallClaim",
    };

    const initializedPayout = await PaymentsService.initializePayout(data);

    initializedPayout.success && schedule.completePayout(data);

    console.log({ initializedPayout }, "🍅");
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
      "assignedLawyerId"
    );
  });
};
