import Agenda from "agenda";
import debug from "debug";

const logger = debug("app:jos:agenda-js");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

logger("creating a mongo connection for agendajs");
const agenda = new Agenda({
  db: {
    address: config.mongoConnect,
    collection: "myAgendaJobs",
    options: { useUnifiedTopology: true },
  },
  processEvery: "2 minute",
  maxConcurrency: 20,
});

export { agenda };
