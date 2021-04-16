import { EVENT_IDENTIFIERS } from "../../constants";

import { sendNotificationToLawyers, sendNotificationToUserOrLawyer } from "./helpers";

export const invitationEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.CREATED, async (invitation) => {
    sendNotificationToLawyers(
      EVENT_IDENTIFIERS.INVITATION.CREATED,
      invitation,
      "INVITATION",
      "CREATED"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.ASSIGNED, async ({ invitation }) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.INVITATION.ASSIGNED,
      invitation,
      "INVITATION",
      "ASSIGNED",
      "ownerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED, async ({ invitation }) => {
    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED,
      invitation,
      "INVITATION",
      "MARK_AS_COMPLETED",
      "ownerId"
    );
  });
};
