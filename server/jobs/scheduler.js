const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];
import { agendaInstance } from "./index";

export const schedule = {
  completePayout: async ({ theModel, lawyerInfo }) => {
    console.log("Indomie 🍲");
    await agendaInstance.schedule(config.payoutInterval, "complete-payout", {
      theModel,
      lawyerInfo,
    });
  },

  staleResponses: async () => {
    console.log("Rice 🍚");
    await agendaInstance.every("2 minutes", "stale-response");
  },
};

agendaInstance.on("ready", () => schedule.staleResponses());
