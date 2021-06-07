import { sendMail } from "../utils";
import PayoutsService from "../modules/payout/services/payout.services";

export const JobHandlers = {
  sendWelcomeMail: async (job, done) => {
    const { email, otp } = job.attrs.data;
    await sendMail({ email, otp });
    done();
  },
  createPayout: async (job, done) => {
    const { data } = job.attrs;
    await PayoutsService.create(data);
    done();
  },
};
