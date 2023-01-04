import debug from "debug";
import LocationServices from "../modules/locationDetail/services/locationDetails.services";

const logger = debug("app:socket-events:admin-online-leave");

const hoistedAdminOnlineLeave = (io, socket) => {
  return async function adminOnlineLeave(payload) {
    // logger(`admin:online:leave I have received this payload ${payload} 🐒🍑`);

    const {
      response: { ownerId, id, assignedLawyerId },
    } = payload;

    io.to(`room ${id}`).emit(
      "on:successful:disconnect",
      `you are successfully unsubscribed to location changes for the response with id ${id}`
    );

    //check weather a room exits if not create one
    socket.leave(`room ${id}`);
    const room = io.of("/").adapter.rooms.get(`room ${id}`);

    console.log({ room }, "🌰");

    if (!room) {
      const [oldUserLocation, oldLawyerLocation] = await Promise.allSettled([
        LocationServices.findByPk(ownerId),
        LocationServices.findByPk(assignedLawyerId),
      ]);

      const [theValueUser, theValueLawyer] = await Promise.allSettled([
        LocationServices.update(ownerId, { room: false }, oldUserLocation.value),
        LocationServices.update(assignedLawyerId, { room: false }, oldLawyerLocation.value),
      ]);
    }
  };
};
export { hoistedAdminOnlineLeave };
