import { EVENT_IDENTIFIERS } from "../constants";
import { eventEmitter } from "../loaders/events";
import ResponsesService from "../modules/response/services/response.services";
import { Op } from "sequelize";
import models from "../models";
import configOptions from "../config/config";
const env = process.env.NODE_ENV || "development";
const config = configOptions[env];

export const handleStaleResponses = async () => {
  const staleResponses = await models.Response.findAll({
    where: {
      status: "initiated",
      createdAt: {
        [Op.lt]: new Date(Date.now() - config.closeStaleResponseInterval * 60 * 1000),
      },
    },
  });

  for (let response of staleResponses) {
    const res = await ResponsesService.remove(response.id);
    console.log({ res });
    eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.DELETED, {
      decodedToken: { id: response.ownerId },
    });
  }
};
