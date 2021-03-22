import { userEvents } from "./userEvents";

const allEvents = [userEvents];

export const manageAllEvents = (eventEmitter) => {
  allEvents.forEach((handler) => handler(eventEmitter));
};
