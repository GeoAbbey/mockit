import debug from "debug";
import { EVENT_IDENTIFIERS, TEMPLATE } from "../../constants";
import AccountInfosService from "../../modules/accountInfo/services/accountInfo.services";
import { sendTemplateEmail } from "../../utils";
const logger = debug("app:handlers:listeners:user-events");

export const userEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.CREATED}`, ({ user }) => {
    logger(`${EVENT_IDENTIFIERS.USER.CREATED} events has been received`);

    const { email, otp, id, firstName } = user.dataValues;
    sendTemplateEmail(email, TEMPLATE.USER_SIGNUP, { firstName, otp: otp.value, email });

    AccountInfosService.create({ id });
  });

  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP}`, async ({ user, query }) => {
    logger(`${EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP} events has been received`);
    if (query.for === "reset-password") {
      //send email for reset-password
    } else {
      // send email for verify-account due to stale otp
    }
  });
};
