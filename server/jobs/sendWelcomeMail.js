import { sendMail } from "../utils";

export const sendWelcomeEmail = {
  handler: async (job, done) => {
    const { email, otp } = job.attrs.data;
    await sendMail({ email, otp });
    done();
  },
};
