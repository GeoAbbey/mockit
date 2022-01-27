import { JobHandlers } from "../handlers";

export const payoutDefinitions = (agenda) => {
  agenda.define(
    "complete-payout",
    {
      priority: "normal",
      concurrency: 10,
    },
    JobHandlers.completePayout
  );
};
