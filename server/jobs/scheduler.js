const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];
import { agendaInstance } from "./index";

export const schedule = {
  sendWelcomeEmail: async ({ email, otp, firstName }) => {
    await agendaInstance.schedule("in 10 seconds", "send-welcome-email", {
      email,
      otp,
      firstName,
    });
  },
  createPayout: async (data) => {
    await agendaInstance.schedule(config.payoutInterval, "create-payout", data);
  },
};
