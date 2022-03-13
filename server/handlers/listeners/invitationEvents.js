import PaymentsService from "../../modules/payment/services/payment.services";
import UserService from "../../modules/users/service/user.service";

import { EVENT_IDENTIFIERS } from "../../constants";

import { sendNotificationToLawyers, sendNotificationToUserOrLawyer } from "./helpers";
import { schedule } from "../../jobs/scheduler";

export const invitationEvents = (eventEmitter) => {
  eventEmitter.on(
    EVENT_IDENTIFIERS.INVITATION.ADMIN_ASSIGN_LAWYER,
    async ({ invitation, decodedToken }) => {
      console.log(`${EVENT_IDENTIFIERS.INVITATION.ADMIN_ASSIGN_LAWYER} has been received`);
      const lawyerToken = await UserService.findByPk(invitation.assignedLawyerId);
      const userToken = await UserService.findByPk(invitation.ownerId);

      sendNotificationToUserOrLawyer(
        EVENT_IDENTIFIERS.INVITATION.ASSIGNED,
        invitation,
        lawyerToken,
        "INVITATION",
        "ASSIGNED",
        "ownerId"
      );

      sendNotificationToUserOrLawyer(
        EVENT_IDENTIFIERS.INVITATION.ASSIGNED,
        invitation,
        userToken,
        "INVITATION",
        "CREATED",
        "assignedLawyerId"
      );
    }
  );

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

      const data = {
        ...invitation.dataValues,
        type: "invitation",
      };

      const initializedPayout = await PaymentsService.initializePayout(data);

      initializedPayout.success &&
        schedule.completePayout({ theModel: data, lawyerInfo: decodedToken });

      console.log({ initializedPayout }, "🍅");
    }
  );
};
