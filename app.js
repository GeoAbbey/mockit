import debug from "debug";
import express from "express";
import http from "http";
import socket from "socket.io";

import Loaders from "./server/loaders";
import { onConnection } from "./server/socketEvents";

const env = process.env.NODE_ENV || "development";
import configOptions from "./server/config/config";
import jwt from "jsonwebtoken";

const config = configOptions[env];

const debugLog = debug("app");

export const startServer = async () => {
  const expressApp = express();

  const { app, routes } = await Loaders.init({ app: expressApp });
  const server = http.createServer(app);
  const io = socket(server, {
    cors: {
      origin: config.clientUri,
      methods: ["GET", "POST"],
    },
  });

  const port = parseInt(process.env.PORT, 10) || 8000;

  io.use((socket, next) => {
    if (socket.handshake.auth.token) {
      const { token } = socket.handshake.auth;
      jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
        if (err) return next(new Error("Authentication error, Invalid Token supplied"));
        return next();
      });
    } else {
      return next(new Error("Authentication error, Please provide a token"));
    }
  });

  io.on("connection", onConnection(io));

  app.set("io", io);

  server.listen(port, () => {
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
