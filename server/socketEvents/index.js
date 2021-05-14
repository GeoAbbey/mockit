import debug from "debug";
import { hoistedIOLawyer } from "./lawyerLocation";
import { hoistedIOUser } from "./userLocation";

const logger = debug("app:socket-events");

export const configureSockets = (io) => {
  logger("I have been activated");
  return { lawyerLocation: hoistedIOLawyer(io), userLocation: hoistedIOUser(io) };
};

export const onConnection = (io) => (socket) => {
  const { userLocation, lawyerLocation } = configureSockets(io);
  socket.on("user:online:location", userLocation);
  socket.on("lawyer:online:location", lawyerLocation);
};
