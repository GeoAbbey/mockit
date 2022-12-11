import { responseDefinitions } from "./response";
import { payoutDefinitions } from "./payout";

const definitions = [responseDefinitions, payoutDefinitions];

export const allDefinitions = (agenda) => {
  definitions.forEach((definition) => definition(agenda));
};
