import debug from "debug";
import LocationServices from "../modules/locationDetail/services/locationDetails.services";
const logger = debug("app:socket-events:admin-online-enter");

const hoistedAdminOnlineEnter = (io, socket) => {
  return async function adminOnlineEnter(payload) {
    logger(`admin:online:enter I have received this payload ${payload} 🍋🧣`);
    const {
      response: { ownerId, id, assignedLawyerId },
    } = payload;

    //check weather a room exits if not create one
    socket.join(`room ${id}`);

    const [oldUserLocation, oldLawyerLocation] = await Promise.allSettled([
      LocationServices.findByPk(ownerId),
      LocationServices.findByPk(assignedLawyerId),
    ]);

    const [theValueUser, theValueLawyer] = await Promise.allSettled([
      LocationServices.update(ownerId, { room: true }, oldUserLocation.value),
      LocationServices.update(assignedLawyerId, { room: true }, oldLawyerLocation.value),
    ]);

    io.to(`room ${id}`).emit(
      "on:successful:connect",
      `you are successfully subscribed to location changes for the response with id ${id}`
    );
  };
};
export { hoistedAdminOnlineEnter };
