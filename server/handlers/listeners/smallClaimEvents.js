import debug from "debug";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA } from "../../constants";

import {
  sendNotificationToLawyers,
  sendNotificationToUserOrLawyer,
  layerMarkInterestForClaim,
} from "./helpers";
const logger = debug("app:handlers:listeners:small-claim-events");

export const smallClaimEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED, (data) => {
    sendNotificationToLawyers(
      EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED,
      data,
      "SMALL_CLAIM",
      "CREATED"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, async (data) => {
    layerMarkInterestForClaim(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, data);
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.ASSIGNED, async (data) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.SMALL_CLAIM.ASSIGNED,
      data,
      "SMALL_CLAIM",
      "ASSIGNED",
      "assignedLawyerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_COMPLETED, async (data) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_AS_COMPLETED,
      data,
      "SMALL_CLAIM",
      "MARK_AS_COMPLETED",
      "ownerId"
    );
  });
};
