import { invitationEvents } from "./invitationEvents";
import { reviewEvents } from "./reviewEvents";
import { userEvents } from "./userEvents";
import { smallClaimEvents } from "./smallClaimEvents";
import { responseEvents } from "./responseEvents";
import { cooperateEvents } from "./cooperateEvents";
import { cooperateAccessEvents } from "./cooperateAccessEvents";
import { withdrawalEvents } from "./withdrawalEvents";

const allEvents = [
  userEvents,
  invitationEvents,
  reviewEvents,
  smallClaimEvents,
  responseEvents,
  cooperateEvents,
  cooperateAccessEvents,
  withdrawalEvents,
];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
