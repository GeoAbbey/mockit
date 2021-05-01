import debug from "debug";
import LocationService from "../modules/locationDetail/services/locationDetails.services";
const debugLog = debug("socketEvents:updateDBWithNewLocation");

export const updateDbWithNewLocation = async (payload, io) => {
  const { ownerId, socketId } = payload;
  debugLog({ ownerId, socketId }, "🐷");
  const [oldLocationDetails, created] = await LocationService.findOrCreate({
    where: {
      ownerId,
    },
    defaults: {
      ownerId,
      socketId,
      online: true,
      location: {
        type: "Point",
        coordinates: [payload.coords.longitude, payload.coords.latitude],
      },
    },
  });

  io.recipient = oldLocationDetails.dataValues;

  if (!created) {
    const [, [newDetails]] = await LocationService.update(
      ownerId,
      {
        location: {
          type: "Point",
          coordinates: [payload.coords.longitude, payload.coords.latitude],
        },
        socketId,
      },
      oldLocationDetails
    );

    io.recipient = newDetails.dataValues;
  }

  debugLog({ realRecipient: io.recipient.assigneeId }, "🔥🙏🏻");
};
