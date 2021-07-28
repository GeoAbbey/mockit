import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../constants";
import { schedule } from "../../jobs/scheduler";

const logger = debug("app:handlers:listeners:user-events");

import AccountInfosService from "../../modules/accountInfo/services/accountInfo.services";

export const userEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.CREATED}`, async ({ user }) => {
    logger(`${EVENT_IDENTIFIERS.USER.CREATED} events has been received`);

    const { email, otp, id, firstName } = user.dataValues;
    await schedule.sendWelcomeEmail({ email, otp, firstName });

    const accountInfo = await AccountInfosService.create({ id });
    logger({ accountInfo });
  });
};
