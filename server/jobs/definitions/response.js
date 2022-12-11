import { JobHandlers } from "../handlers";

export const responseDefinitions = (agenda) => {
  agenda.define(
    "stale-response",
    {
      priority: "normal",
      concurrency: 10,
    },
    JobHandlers.staleResponses
  );
};
