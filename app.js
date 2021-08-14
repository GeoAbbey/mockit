import debug from "debug";
import express from "express";
import http from "http";
import socket from "socket.io";
import jwt from "jsonwebtoken";

import Loaders from "./server/loaders";
import { onConnection } from "./server/socketEvents";
import UsersService from "./server/modules/users/service/user.service";

const debugLog = debug("app");

export const startServer = async () => {
  const expressApp = express();

  const { app, routes } = await Loaders.init({ app: expressApp });
  const server = http.createServer(app);
  const io = socket(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const port = parseInt(process.env.PORT, 10) || 8000;

  io.use((socket, next) => {
    if (socket.handshake.auth.token) {
      const { token } = socket.handshake.auth;
      jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
        if (err) return next(new Error("Authentication error, Invalid Token supplied"));
        const theUser = await UsersService.findByPk(decodedToken.id);
        if (!theUser)
          return next(
            new Error("Invalid Email or Password, Kindly contact the admin if this is an anomaly")
          );

        if (theUser.dataValues.isAccountSuspended)
          return next(new Error("You account has been suspended kindly contact the admin"));
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
