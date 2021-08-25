import debug from "debug";

const logger = debug("app:socket-events:admin-online");

const hoistedAdminOnline = (io) => {
  return async function adminOnline(payload) {
    logger(`admin:online I have received this payload ${payload} 🐥🥶`);
    console.log({ payload });
  };
};
export { hoistedAdminOnline };
