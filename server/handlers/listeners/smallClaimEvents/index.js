import debug from "debug";
import { EVENT_IDENTIFIERS, ROLES, TEMPLATE } from "../../../constants";
import PaymentsService from "../../../modules/payment/services/payment.services";
import UserService from "../../../modules/users/service/user.service";
import { layerMarkInterestOrUpdateStatusForClaim } from "../helpers";
const logger = debug("app:handlers:listeners:small-claim-events");

import { schedule } from "../../../jobs/scheduler";
import { data } from "./data";
import { notifyAdminOfNoLawyer } from "../helpers/notifyAdminOfNoLawyer";
import { updateModelInstance } from "../helpers/updateModelInstance";
import { notifyPeople } from "../helpers/notifyPeople";
import { sendMail } from "../../../utils/MailService";
import smallClaimsService from "../../../modules/small-claims/services/small-claims.service";

export const smallClaimEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED, async (claim, decodedToken) => {
    logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED} event has been received`);

    const notificationData = data.CREATED({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: claim.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    const lawyers = await UserService.findMany({
      role: ROLES.LAWYER,
      address: { country: claim.venue.country, state: claim.venue.state },
    });

    if (!lawyers.length) notifyAdminOfNoLawyer(claim, "SMALL_CLAIM");
    else updateModelInstance(claim, "SMALL_CLAIM");

    notifyPeople({
      event: EVENT_IDENTIFIERS.SMALL_CLAIM.CREATED,
      people: lawyers,
      notificationData,
    });

    // sendBulkTemplatedEmail(lawyers, TEMPLATE.SMALL_CLAIM_CREATED, {
    //   ticketId: claim.ticketId,
    // });
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, async (claim, decodedToken) => {
    logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST} event has been received`);

    layerMarkInterestOrUpdateStatusForClaim(
      EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST,
      claim,
      decodedToken,
      "MARK_INTEREST"
    );
  });

  eventEmitter.on(
    EVENT_IDENTIFIERS.SMALL_CLAIM.EDIT_INTEREST,
    async ({ updatedInterest, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.EDIT_INTEREST} event has been received`);

      const theClaim = await smallClaimsService.find(updatedInterest.claimId);

      if (decodedToken.id === theClaim.assignedLawyerId) {
        const [, [newClaim]] = await smallClaimsService.update(
          theClaim.id,
          { isReassessed: true },
          theClaim
        );
      }

      const userToken = await UserService.findByPk(theClaim.ownerId);

      const notificationData = data.EDIT_INTEREST({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: updatedInterest.claimId,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.SMALL_CLAIM.EDIT_INTEREST,
        people: [userToken],
        notificationData,
      });
    }
  );

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.CANCELLED, async (claim, decodedToken) => {
    logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.CANCELLED} event has been received`);

    const userToken = await UserService.findByPk(claim.ownerId);

    const notificationData = data.CANCELLED({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: claim.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    notifyPeople({
      event: EVENT_IDENTIFIERS.SMALL_CLAIM.CANCELLED,
      people: [userToken],
      notificationData,
    });

    sendTemplateEmail(
      userToken.dataValues.email,
      TEMPLATE.SMALL_CLAIM_ASSIGNED,
      { firstName: userToken.dataValues.firstName },
      claim.ticketId
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.COMPLETED, async (claim, decodedToken) => {
    logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.COMPLETED} event  has been received`);

    const userToken = await UserService.findByPk(claim.ownerId);

    const notificationData = data.MARK_AS_COMPLETED({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: claim.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    notifyPeople({
      event: EVENT_IDENTIFIERS.SMALL_CLAIM.COMPLETED,
      people: [userToken],
      notificationData,
    });

    sendMail({
      email: userToken.dataValues.email,
      firstName: userToken.dataValues.firstName,
      templateId: TEMPLATE.SMALL_CLAIM_COMPLETED,
    });
  });

  eventEmitter.on(
    EVENT_IDENTIFIERS.SMALL_CLAIM.CONSULTATION_COMPLETED,
    async (claim, decodedToken) => {
      logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.CONSULTATION_COMPLETED} event has been received`);

      const userToken = await UserService.findByPk(claim.ownerId);

      const notificationData = data.CONSULTATION_COMPLETED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: claim.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.SMALL_CLAIM.CONSULTATION_COMPLETED,
        people: [userToken],
        notificationData,
      });

      const theData = {
        ...claim.dataValues,
        type: "smallClaim",
      };

      const initializedPayout = await PaymentsService.initializePayout(theData);

      initializedPayout.success &&
        schedule.completePayout({ theModel: theData, lawyerInfo: decodedToken });

      console.log({ initializedPayout }, "🍅");
    }
  );

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.PAID, async (claim, decodedToken) => {
    logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.PAID} event has been received`);

    const lawyerToken = await UserService.findByPk(claim.assignedLawyerId);

    const notificationData = data.PAID({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: claim.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    notifyPeople({
      event: EVENT_IDENTIFIERS.SMALL_CLAIM.PAID,
      people: [lawyerToken],
      notificationData,
    });
  });

  eventEmitter.on(EVENT_IDENTIFIERS.SMALL_CLAIM.CLOSED, async (claim, decodedToken) => {
    logger(`${EVENT_IDENTIFIERS.SMALL_CLAIM.CLOSED} event has been received`);

    const lawyerToken = await UserService.findByPk(claim.assignedLawyerId);

    const notificationData = data.CLOSED({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: claim.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    notifyPeople({
      event: EVENT_IDENTIFIERS.SMALL_CLAIM.CLOSED,
      people: [lawyerToken],
      notificationData,
    });
  });
};
