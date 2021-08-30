import { invitationEvents } from "./invitationEvents";
import { reviewEvents } from "./reviewEvents";
import { userEvents } from "./userEvents";
import { smallClaimEvents } from "./smallClaimEvents";
import { responseEvents } from "./responseEvents";
import { cooperateEvents } from "./cooperateEvents";

const allEvents = [
  userEvents,
  invitationEvents,
  reviewEvents,
  smallClaimEvents,
  responseEvents,
  cooperateEvents,
];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
