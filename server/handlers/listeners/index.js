import { invitationEvents } from "./invitationEvents";
import { reviewEvents } from "./reviewEvents";
import { userEvents } from "./userEvents";
import { smallClaimEvents } from "./smallClaimEvents";
import { responseEvents } from "./responseEvents";
import { cooperateEvents } from "./cooperateEvents";
import { cooperateAccessEvents } from "./cooperateAccessEvents";

const allEvents = [
  userEvents,
  invitationEvents,
  reviewEvents,
  smallClaimEvents,
  responseEvents,
  cooperateEvents,
  cooperateAccessEvents,
];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
