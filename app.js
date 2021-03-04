import debug from "debug";
import express from "express";
import Loaders from "./server/loaders";

const debugLog = debug("app");

export const startServer = async () => {
  const expressApp = express();

  const { app, routes } = await Loaders.init({ app: expressApp });
  const port = parseInt(process.env.PORT, 10) || 8000;

  app.listen(port, () => {
    debugLog(`Zapp Lawyer Backend app  listening at http://localhost:${port}`);
    routes.forEach((route) => {
      debugLog(`Routes configured for ${route.getName()}`);
    });
  });

  process.on("uncaughtException", (error) => {
    debugLog("Oh my god, something terrible happened: ", error);
    process.exit(1); // exit application
  });

  process.on("unhandledRejection", (error, promise) => {
    debugLog(" Oh Lord! We forgot to handle a promise rejection here: ", promise);
    debugLog(" The error was: ", error);
  });
};
