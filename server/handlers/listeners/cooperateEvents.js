import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../constants";
import CooperateAccessService from "../../modules/cooperateAccess/services/cooperate-access.services";

const logger = debug("app:handlers:listeners:cooperate-events");

export const cooperateEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.COOPERATE.CREATED}`, async ({ data, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.COOPERATE.CREATED} events has been received`);
    console.log({ data, decodedToken }, "🧩");

    const { email: userEmail, id: ownerId } = decodedToken;
    CooperateAccessService.findOrCreate({ userEmail, ownerId });
  });
};
