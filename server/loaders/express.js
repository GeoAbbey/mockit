import express from "express";
import winston from "winston";
import expressWinston from "express-winston";
import cors from "cors";
import helmet from "helmet";

import { initializeRoutes } from "../modules/";

export default async ({ app }) => {
  const path = "/api/v1";

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());
  app.use(helmet());

  const routes = initializeRoutes({ app, path });

  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    })
  );

  app.get("*", (req, res) =>
    res.status(200).send({
      message: "Welcome to the beginning of nothingness.",
    })
  );

  app.use((err, req, res, next) => {
    const { stack, status = 500, message } = err;
    return res.status(status).send({ message, stack });
  });

  return { app, routes };
};
