import { agenda } from "./agenda";
import { JobHandlers } from "./handlers";

agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

agenda.define(
  "send-welcome-email",
  {
    priority: "high",
    concurrency: 10,
  },
  JobHandlers.sendWelcomeMail
);

agenda.define(
  "create-payout",
  {
    priority: "normal",
    concurrency: 10,
  },
  JobHandlers.createPayout
);

agenda.start();

export { agenda as agendaInstance };
