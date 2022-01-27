import { mailDefinitions } from "./mails";
import { payoutDefinitions } from "./payout";

const definitions = [mailDefinitions, payoutDefinitions];

export const allDefinitions = (agenda) => {
  definitions.forEach((definition) => definition(agenda));
};
