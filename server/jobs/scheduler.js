const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];
import { agendaInstance } from "./index";

export const schedule = {
  completePayout: async (data) => {
    await agendaInstance.schedule(config.payoutInterval, "complete-payout", data);
  },
};
