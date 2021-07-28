import { sendTemplateEmail } from "../utils";
import PayoutsService from "../modules/payout/services/payout.services";
import { TEMPLATE } from "../constants";

export const JobHandlers = {
  sendWelcomeMail: async (job, done) => {
    const { email, otp, firstName } = job.attrs.data;
    await sendTemplateEmail(email, TEMPLATE.USER_SIGNUP, { firstName, otp: otp.value, email });
    done();
  },
  createPayout: async (job, done) => {
    const { data } = job.attrs;
    await PayoutsService.create(data);
    done();
  },
};
