import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../../constants";
import { schedule } from "../../../jobs/scheduler";
import paymentServices from "../../../modules/payment/services/payment.services";
import smallClaimsService from "../../../modules/small-claims/services/small-claims.service";
import UserService from "../../../modules/users/service/user.service";
import { notifyPeople } from "../helpers/notifyPeople";
import { data } from "./data";

const logger = debug("app:handlers:listeners:mile-stone-events");

export const mileStoneEvents = (eventEmitter) => {
  eventEmitter.on(
    `${EVENT_IDENTIFIERS.MILESTONE.CREATED}`,
    async ({ theMileStones: { mileStones }, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.MILESTONE.CREATED} events has been received`);

      const claim = await smallClaimsService.find(mileStones[0].claimId);

      const userToken = await UserService.findByPk(claim.ownerId);

      const notificationData = data.CREATED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: claim.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.MILESTONE.CREATED,
        people: [userToken],
        notificationData,
      });
    }
  );

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.MILESTONE.COMPLETED}`,
    async ({ mileStone, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.MILESTONE.COMPLETED} events has been received`);

      const claim = await smallClaimsService.find(mileStone.claimId);

      const userToken = await UserService.findByPk(claim.ownerId);

      const notificationData = data.COMPLETED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: claim.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.MILESTONE.COMPLETED,
        people: [userToken],
        notificationData,
      });

      const theData = {
        ...mileStone.dataValues,
        type: "mileStone",
      };

      const initializedPayout = await paymentServices.initializePayout(theData);

      initializedPayout.success &&
        schedule.completePayout({ theModel: theData, lawyerInfo: decodedToken });
    }
  );

  eventEmitter.on(`${EVENT_IDENTIFIERS.MILESTONE.PAID}`, async ({ mileStone, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.MILESTONE.PAID} events has been received`);

    const claim = await smallClaimsService.find(mileStone.claimId);

    const lawyerToken = await UserService.findByPk(claim.assignedLawyerId);

    const notificationData = data.PAID({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: claim.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    notifyPeople({
      event: EVENT_IDENTIFIERS.MILESTONE.PAID,
      people: [lawyerToken],
      notificationData,
    });
  });
};
