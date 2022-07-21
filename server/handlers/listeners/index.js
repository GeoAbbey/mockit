import { invitationEvents } from "./invitationEvents";
import { reviewEvents } from "./reviewEvents";
import { userEvents } from "./userEvents";
import { smallClaimEvents } from "./smallClaimEvents";
import { responseEvents } from "./responseEvents";
import { cooperateEvents } from "./cooperateEvents";
import { cooperateAccessEvents } from "./corporateAccessEvents";
import { withdrawalEvents } from "./withdrawalEvents";
import { mileStoneEvents } from "./milestoneEvents";

const allEvents = [
  userEvents,
  invitationEvents,
  reviewEvents,
  smallClaimEvents,
  responseEvents,
  cooperateEvents,
  cooperateAccessEvents,
  withdrawalEvents,
  mileStoneEvents,
];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
