import { agenda } from "./agenda";
import { allDefinitions } from "./definitions";
agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

allDefinitions(agenda);

agenda.start();

console.log({ jobs: agenda._definitions });

export { agenda as agendaInstance };
