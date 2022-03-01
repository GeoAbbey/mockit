import debug from "debug";
import { hoistedIOLawyer } from "./lawyerLocation";
import { hoistedIOUser } from "./userLocation";
import { hoistedAdminOnlineEnter } from "./adminOnlineEnter";
import { hoistedAdminOnlineLeave } from "./adminOnlineLeave";

const logger = debug("app:socket-events");

export const configureSockets = (io, socket) => {
  logger("I have been activated");
  return {
    lawyerLocation: hoistedIOLawyer(io),
    userLocation: hoistedIOUser(io),
    adminOnlineEnter: hoistedAdminOnlineEnter(io, socket),
    adminOnlineLeave: hoistedAdminOnlineLeave(io, socket),
  };
};

export const onConnection = (io) => (socket) => {
  const { userLocation, lawyerLocation, adminOnlineEnter, adminOnlineLeave } = configureSockets(
    io,
    socket
  );
  socket.on("user:online:location", userLocation);
  socket.on("lawyer:online:location", lawyerLocation);
  socket.on("admin:online:enter", adminOnlineEnter);
  socket.on("admin:online:leave", adminOnlineLeave);
};
