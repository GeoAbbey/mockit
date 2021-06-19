import RecipientsService from "../../modules/recipient/services/recipient.services";
import PayoutsController from "../../modules/payout/controllers/payout.controller";

import { EVENT_IDENTIFIERS } from "../../constants";

import { sendNotificationToLawyers, sendNotificationToUserOrLawyer } from "./helpers";
import { schedule } from "../../jobs/scheduler";

const getAmount = PayoutsController.getAmount;

export const invitationEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.CREATED, async ({ invitation, decodedToken }) => {
    console.log({ invitation, decodedToken }, "🐥");
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

      const {
        dataValues: { ownerId, assignedLawyerId, id },
      } = invitation;

      const lawyerRecipientDetails = await RecipientsService.find(assignedLawyerId);

      const data = {
        recipient: lawyerRecipientDetails.dataValues.code,
        reason: JSON.stringify({
          modelType: "invitation",
          modelId: id,
          text: "payment made from mark as complete",
          id: ownerId,
          lawyerId: assignedLawyerId,
        }),
        amount: await getAmount("invitation"),
      };

      await schedule.createPayout(data);
    }
  );
};
