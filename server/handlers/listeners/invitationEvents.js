import { EVENT_IDENTIFIERS } from "../../constants";

import { sendNotificationToLawyers, sendNotificationToUserOrLawyer } from "./helpers";

export const invitationEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.CREATED, async ({ invitation, decodedToken }) => {
    sendNotificationToLawyers(
      EVENT_IDENTIFIERS.INVITATION.CREATED,
      invitation,
      decodedToken,
      "INVITATION",
      "CREATED"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.ASSIGNED, async ({ invitation, decodedToken }) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.INVITATION.ASSIGNED,
      invitation,
      decodedToken,
      "INVITATION",
      "ASSIGNED",
      "ownerId"
    );
  });

  eventEmitter.on(
    EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED,
    async ({ invitation, decodedToken }) => {
      sendNotificationToUserOrLawyer(
        EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED,
        invitation,
        decodedToken,
        "INVITATION",
        "MARK_AS_COMPLETED",
        "ownerId"
      );
    }
  );
};
