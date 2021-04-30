import LocationService from "../modules/locationDetail/services/locationDetails.services";

const hoistedIOLawyer = (io) => {
  return async function lawyerLocation(payload) {
    console.log(`I was called with ${payload.coords.longitude} 🐥`);
    const {
      decodedToken: { id },
    } = io;
    const socketId = io.socketId;
    const [oldLocationDetails, created] = await LocationService.findOrCreate({
      where: {
        ownerId: id,
      },
      defaults: {
        ownerId: id,
        socketId,
        online: true,
        location: {
          type: "Point",
          coordinates: [payload.coords.longitude, payload.coords.latitude],
        },
      },
    });

    console.log({ oldLocationDetails }, "🥶");
    // const newDetails = await LocationService.update(
    //   id,
    //   {
    //     location: {
    //       type: "Point",
    //       coordinates: [payload.coords.longitude, payload.coords.latitude],
    //     },
    //     socketId,
    //   },
    //   oldLocationDetails
    // );

    // console.log({ newDetails }, "🍅");
  };
};

export { hoistedIOLawyer };
