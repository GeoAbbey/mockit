import { invitationEvents } from "./invitationEvents";
import { reviewEvents } from "./reviewEvents";
import { userEvents } from "./userEvents";
import { smallClaimEvents } from "./smallClaimEvents";

const allEvents = [userEvents, invitationEvents, reviewEvents, smallClaimEvents];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
