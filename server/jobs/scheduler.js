import { agendaInstance } from "./index";

export const schedule = {
  sendWelcomeEmail: async ({ email, otp }) => {
    await agendaInstance.schedule("in 10 seconds", "send-welcome-email", {
      email,
      otp,
    });
  },
};
