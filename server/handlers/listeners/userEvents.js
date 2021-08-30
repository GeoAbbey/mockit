import debug from "debug";
import { EVENT_IDENTIFIERS, TEMPLATE } from "../../constants";
import AccountInfosService from "../../modules/accountInfo/services/accountInfo.services";
import LocationService from "../../modules/locationDetail/services/locationDetails.services";
import { sendTemplateEmail } from "../../utils";
const logger = debug("app:handlers:listeners:user-events");

export const userEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.CREATED}`, ({ user }) => {
    logger(`${EVENT_IDENTIFIERS.USER.CREATED} events has been received`);

    const { email, otp, id, firstName, role } = user.dataValues;
    sendTemplateEmail(email, role === "user" ? TEMPLATE.USER_SIGNUP : TEMPLATE.LAWYER_SIGNUP, {
      firstName,
      otp: otp.value,
      email,
    });

    AccountInfosService.create({ id });
    LocationService.findOrCreate({ where: { id }, defaults: { id } });
  });

  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP}`, async ({ user, query }) => {
    const { email, otp, id, firstName, role } = user.dataValues;

    logger(`${EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP} events has been received`);
    if (query.for === "reset-password") {
      //send email for reset-password
      sendTemplateEmail(email, TEMPLATE.OTP_RESET_PASSWORD, { firstName, otp: otp.value, email });
    } else {
      // send email for verify-account due to stale otp
      sendTemplateEmail(email, TEMPLATE.OTP_VERIFY_EMAIL, { firstName, otp: otp.value, email });
    }
  });
};
