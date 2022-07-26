import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../../constants";
import { schedule } from "../../../jobs/scheduler";
import paymentServices from "../../../modules/payment/services/payment.services";

const logger = debug("app:handlers:listeners:MileStone-events");

export const mileStoneEvents = (eventEmitter) => {
  eventEmitter.on(
    `${EVENT_IDENTIFIERS.MILESTONE.CREATED}`,
    async ({ data: mileStones, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.MILESTONE.CREATED} events has been received`);
    }
  );

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.MILESTONE.COMPLETED}`,
    async ({ mileStone, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.MILESTONE.COMPLETED} events has been received`);

      const theData = {
        ...mileStone.dataValues,
        type: "mileStone",
      };

      const initializedPayout = await paymentServices.initializePayout(theData);

      initializedPayout.success &&
        schedule.completePayout({ theModel: theData, lawyerInfo: decodedToken });

      console.log({ initializedPayout }, "🍅");
    }
  );

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.MILESTONE.PAID}`,
    async ({ data: mileStone, decodedToken }) => {}
  );
};
