import debug from "debug";

import { updateDbWithNewLocation } from "./updateDBWithNewLocation";
import LocationServices from "../modules/locationDetail/services/locationDetails.services";

const logger = debug("app:socket-events:lawyer-location");

const hoistedIOLawyer = (io) => {
  return async function lawyerLocation(payload) {
    logger(`lawyer:online:location I have received this payload ${payload} 🐥🥶`);
    await updateDbWithNewLocation(payload, io);
    const { recipient } = io;
    if (recipient.assigneeId) {
      logger({ assignedId: recipient.assigneeId }, "lawyer:online");
      const deliverTo = await LocationServices.find({ where: { id: recipient.assigneeId } });
      const { socketId } = deliverTo.dataValues;

      io.to(socketId).emit("on:move", { location: recipient.location });
    }
  };
};

export { hoistedIOLawyer };
