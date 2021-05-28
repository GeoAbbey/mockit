import debug from "debug";

import { updateDbWithNewLocation } from "./updateDBWithNewLocation";
import LocationServices from "../modules/locationDetail/services/locationDetails.services";

const logger = debug("app:socket-events:user-location");

const hoistedIOUser = (io) => {
  return async function userLocation(payload) {
    logger(`user:online:location I have received this payload ${payload} 🐥🍅`);
    await updateDbWithNewLocation(payload, io);
    const { recipient } = io;
    if (recipient.assigneeId) {
      logger({ assignedId: recipient.assigneeId }, "user:online");
      const deliverTo = await LocationServices.find({ where: { id: recipient.assigneeId } });
      const { socketId } = deliverTo.dataValues;

      io.to(socketId).emit("on:move", {
        location: recipient.location,
        distance: calcCrow(recipient.location.coordinates, location.coordinates),
        speed: recipient.speed,
      });
    }
  };
};

export { hoistedIOUser };
