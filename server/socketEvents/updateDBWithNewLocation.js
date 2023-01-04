import debug from "debug";
import LocationService from "../modules/locationDetail/services/locationDetails.services";
const debugLog = debug("socketEvents:updateDBWithNewLocation");

export const updateDbWithNewLocation = async (payload, io, oldLocationDetails) => {
  const { id, socketId } = payload;
  // debugLog({ id, socketId }, "🐷");
  const [, [newDetails]] = await LocationService.update(
    id,
    {
      speed: payload.coords.speed,
      location: {
        type: "Point",
        coordinates: [payload.coords.longitude, payload.coords.latitude],
      },
      socketId,
    },
    oldLocationDetails
  );

  io.recipient = newDetails.dataValues;

  // debugLog({ realRecipient: io.recipient.assigningId }, "🔥🙏🏻");
};
