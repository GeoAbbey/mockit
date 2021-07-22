import debug from "debug";

import { updateDbWithNewLocation } from "./updateDBWithNewLocation";
import LocationServices from "../modules/locationDetail/services/locationDetails.services";
import { calcCrow } from "./helpers";

const logger = debug("app:socket-events:user-location");

const hoistedIOUser = (io) => {
  return async function userLocation(payload) {
    logger(`user:online:location I have received this payload ${payload} 🐥🍅`);
    await updateDbWithNewLocation(payload, io);
    const { recipient } = io;
    if (recipient.assigningId) {
      logger({ assigningId: recipient.assigningId }, "user:online");
      const deliverTo = await LocationServices.find({ where: { id: recipient.assigningId } });
      const { socketId, location } = deliverTo.dataValues;

      io.to(socketId).emit("on:move", {
        location: recipient.location,
        distance: calcCrow(recipient.location.coordinates, location.coordinates),
        speed: recipient.speed,
      });
    }
  };
};

export { hoistedIOUser };
