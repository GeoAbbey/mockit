import debug from "debug";
import { EVENT_IDENTIFIERS, TEMPLATE, NOTIFICATION_DATA } from "../../constants";
import AccountInfosService from "../../modules/accountInfo/services/accountInfo.services";
import LocationService from "../../modules/locationDetail/services/locationDetails.services";
import { sendTemplateEmail } from "../../utils";
const logger = debug("app:handlers:listeners:user-events");

import configOptions from "../../config/config";
const env = process.env.NODE_ENV || "development";
const config = configOptions[env];

export const userEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.CREATED}`, ({ user }) => {
    logger(`${EVENT_IDENTIFIERS.USER.CREATED} events has been received`);

    const { email, otp, id, firstName, role } = user.dataValues;
    if (role === "user")
      sendTemplateEmail(email, TEMPLATE.USER_SIGNUP, {
        firstName,
        otp: otp.value,
        email,
      });

    if (role === "lawyer")
      sendTemplateEmail(email, TEMPLATE.LAWYER_SIGNUP, {
        firstName,
        otp: otp.value,
        email,
      });

    if (role === "admin")
      sendTemplateEmail(email, TEMPLATE.USER_SIGNUP, {
        firstName,
        otp: config.lawyerPassword,
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

  eventEmitter.on(
    `${EVENT_IDENTIFIERS.ONE_TIME_SUBSCRIPTION_FEE.AUTHORIZED}`,
    async ({ lawyerInfo }) => {
      logger(`${EVENT_IDENTIFIERS.ONE_TIME_SUBSCRIPTION_FEE.AUTHORIZED} events has been received`);
      const { firebaseToken, id, email, firstName, lastName } = lawyerInfo;

      //sendMail
    }
  );
};
