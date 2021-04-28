import { invitationEvents } from "./invitationEvents";
import { reviewEvents } from "./reviewEvents";
import { userEvents } from "./userEvents";
import { smallClaimEvents } from "./smallClaimEvents";
import { responseEvents } from "./responseEvents";

const allEvents = [userEvents, invitationEvents, reviewEvents, smallClaimEvents, responseEvents];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
