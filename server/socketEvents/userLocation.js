import debug from "debug";
const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";
const config = configOptions[env];

import { updateDbWithNewLocation } from "./updateDBWithNewLocation";
import LocationServices from "../modules/locationDetail/services/locationDetails.services";
import { calcCrow } from "./helpers";

const logger = debug("app:socket-events:user-location");

const hoistedIOUser = (io) => {
  return async function userLocation(payload) {
    logger(`user:online:location I have received this payload ${payload} 🐥🍅`);
    const isOnline = await LocationServices.findByPk(payload.id);
    if (isOnline.dataValues.online) {
      await updateDbWithNewLocation(payload, io, isOnline);
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
      } else if (!recipient.assigningId && recipient.online) {
        logger(`on:surrounding:lawyers: finding surrounding lawyers`, { recipient }, "🦋");
        const { socketId, location } = recipient;
        io.to(socketId).emit("on:surrounding:lawyers", {
          results: await LocationServices.findLawyersWithinRadius({
            longitude: location.coordinates[0],
            latitude: location.coordinates[1],
            radius: config.radius,
          }),
          message: `Lawyers available within the given radius ${config.radius}`,
        });
      }
    }

    const { room, currentResponseId } = isOnline.dataValues;

    if (room && currentResponseId) {
      io.to(`room ${currentResponseId}`).emit("on:user:move", {
        location: recipient.location,
        distance: calcCrow(recipient.location.coordinates, location.coordinates),
        speed: recipient.speed,
      });
    }
  };
};

export { hoistedIOUser };
