import { agenda } from "./agenda";
import { sendWelcomeEmail } from "./sendWelcomeMail";

agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

agenda.define(
  "send-welcome-email",
  {
    priority: "high",
    concurrency: 10,
  },
  sendWelcomeEmail.handler
);

agenda.start();

export { agenda as agendaInstance };
