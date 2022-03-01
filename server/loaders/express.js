import express from "express";
import winston from "winston";
import expressWinston from "express-winston";
import cors from "cors";
import helmet from "helmet";
import { eventEmitter } from "./events";
import debug from "debug";

import { initializeRoutes } from "../modules/";
import { manageAllEvents } from "../handlers/listeners";
import { agendaUI } from "./agendaUI";
import { agendaInstance } from "../jobs";
import { messaging } from "./firebaseInit";

const logger = debug("app:loaders:express");

export default async ({ app }) => {
  const path = "/api/v1";

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet());

  app.set("eventEmitter", eventEmitter);

  agendaUI(app, agendaInstance);

  const routes = initializeRoutes({ app, path });

  manageAllEvents(eventEmitter);

  logger({ messaging });

  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    })
  );

  app.get("/api/v1/callback", (req, res) => res.status(200).send(""));

  app.get("*", (req, res) =>
    res.status(200).send({
      message: "Welcome to the beginning of nothingness.",
    })
  );

  app.use((err, req, res, next) => {
    const { stack, status = 500 } = err;
    logger(stack);
    return res.status(status).send({ err });
  });

  return { app, routes };
};
