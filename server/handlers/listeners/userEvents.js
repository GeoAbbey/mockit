import debug from "debug";
import { EVENT_IDENTIFIERS, TEMPLATE } from "../../constants";
import AccountInfosService from "../../modules/accountInfo/services/accountInfo.services";
import { sendTemplateEmail } from "../../utils";
const logger = debug("app:handlers:listeners:user-events");

export const userEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.CREATED}`, async ({ user }) => {
    logger(`${EVENT_IDENTIFIERS.USER.CREATED} events has been received`);

    const { email, otp, id, firstName } = user.dataValues;
    await sendTemplateEmail(email, TEMPLATE.USER_SIGNUP, { firstName, otp: otp.value, email });

    const accountInfo = await AccountInfosService.create({ id });
    logger({ accountInfo });
  });
};
