import debug from "debug";
import axios from "axios";
import { EVENT_IDENTIFIERS, TEMPLATE } from "../../constants";
import AccountInfosService from "../../modules/accountInfo/services/accountInfo.services";
import LocationService from "../../modules/locationDetail/services/locationDetails.services";
import { sendMail, sendTemplateEmail } from "../../utils";
const logger = debug("app:handlers:listeners:user-events");

import configOptions from "../../config/config";
import { smsService } from "../../utils/smsServices";
import { applicationMappers, messageTemplateMappers } from "../../utils/smsServices/mappers";
import userService from "../../modules/users/service/user.service";
const env = process.env.NODE_ENV || "development";
const config = configOptions[env];

const SMSService = smsService(axios);

sendMail;

export const userEvents = (eventEmitter) => {
  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.CREATED}`, async ({ user }) => {
    logger(`${EVENT_IDENTIFIERS.USER.CREATED} events has been received`);

    const { email, otp, id, firstName, role, phone } = user.dataValues;
    if (role === "user") sendMail({ firstName, email, templateId: TEMPLATE.USER_SIGNUP });

    if (role === "lawyer") sendMail({ firstName, email, templateId: TEMPLATE.LAWYER_SIGNUP });

    AccountInfosService.create({ id });
    LocationService.findOrCreate({ where: { id }, defaults: { id } });
    const {
      response: { pinId },
    } = await SMSService.send2FAPin({
      to: phone,
      applicationId: applicationMappers.verifyPhoneId,
      messageId: messageTemplateMappers.verifyPhoneMessageId,
    });

    userService.update(id, { settings: { isPhone: { pinId } } }, user.dataValues);
  });

  eventEmitter.on(`${EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP}`, async ({ user, query }) => {
    const { email, otp, id, firstName, role } = user.dataValues;

    logger(`${EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP} events has been received`);
    if (query.for === "reset-password") {
      //send email for reset-password
      // sendTemplateEmail(email, TEMPLATE.OTP_RESET_PASSWORD, { firstName, otp: otp.value, email });
    } else {
      // send email for verify-account due to stale otp
      // sendTemplateEmail(email, TEMPLATE.OTP_VERIFY_EMAIL, { firstName, otp: otp.value, email });
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
