import { hoistedIOLawyer } from "./lawyerLocation";
import { hoistedIOUser } from "./userLocation";

export const configureSockets = (io) => {
  console.log("I have been activated");
  return { lawyerLocation: hoistedIOLawyer(io), userLocation: hoistedIOUser(io) };
};

export const onConnection = (io) => (socket) => {
  const { userLocation, lawyerLocation } = configureSockets(io);
  io.socketId = socket.id;
  socket.on("user:online:location", userLocation);
  socket.on("lawyer:online:location", lawyerLocation);
};
