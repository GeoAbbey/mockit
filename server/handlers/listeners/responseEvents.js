import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../constants";
import LocationServices from "../../modules/locationDetail/services/locationDetails.services";
import EligibleLawyersService from "../../modules/eligibleLawyers/services/eligibleLawyers.services";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../config/config.js";
const config = configOptions[env];

import { sendNotificationToUserOrLawyer, sendNotificationToEligibleLawyers } from "./helpers";
const logger = debug("app:handlers:listeners:response-events");

export const responseEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.ASSIGNED, async ({ response }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.ASSIGNED} event was received`);

    logger({ response });

    const {
      dataValues: { ownerId, assignedLawyerId },
    } = response;

    const [userLocationDetails, lawyerLocationDetails] = await Promise.all([
      LocationServices.find({ where: { ownerId } }),
      LocationServices.find({ where: { ownerId: assignedLawyerId } }),
    ]);

    const [[, updatedUserDetails], [, updatedLawyerDetails]] = await Promise.all([
      LocationServices.update(
        userLocationDetails.ownerId,
        {
          assigneeId: assignedLawyerId,
        },
        userLocationDetails
      ),
      LocationServices.update(
        lawyerLocationDetails.ownerId,
        {
          assigneeId: ownerId,
        },
        lawyerLocationDetails
      ),
    ]);
    await sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.RESPONSE.ASSIGNED,
      response,
      "RESPONSE",
      "ASSIGNED",
      "ownerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.MEET_TIME, async ({ response, io }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.MEET_TIME} event was received`);

    logger({ response });

    const {
      dataValues: { ownerId, assignedLawyerId },
    } = response;

    const [userLocationDetails, lawyerLocationDetails] = await Promise.all([
      LocationServices.find({ where: { ownerId } }),
      LocationServices.find({ where: { ownerId: assignedLawyerId } }),
    ]);

    const [[, updatedUserDetails], [, updatedLawyerDetails]] = await Promise.all([
      LocationServices.update(
        userLocationDetails.dataValues.ownerId,
        {
          assigneeId: null,
          online: false,
        },
        userLocationDetails
      ),
      LocationServices.update(
        lawyerLocationDetails.dataValues.ownerId,
        {
          assigneeId: null,
        },
        lawyerLocationDetails
      ),
    ]);

    io.to(updatedUserDetails.dataValues.socketId).emit("on:meet", {
      userStatus: updatedUserDetails.dataValues,
    });

    await sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.RESPONSE.MEET_TIME,
      response,
      "RESPONSE",
      "MEET_TIME",
      "ownerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.CREATED, async ({ response }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.CREATED} event was received`);
    const {
      dataValues: { id: responseId },
    } = response;
    const {
      startingLocation: { coordinates },
    } = response;

    //return all the lawyers that are online within the given radius
    const results = await LocationServices.findLawyersWithinRadius({
      longitude: coordinates[0],
      latitude: coordinates[1],
      radius: config.radius,
    });

    const lawyerModifiedWithResponseId = [];

    results.forEach((result) => {
      lawyerModifiedWithResponseId.push({ lawyerId: result.id, responseId });
    });

    const answer = await EligibleLawyersService.bulkCreate(lawyerModifiedWithResponseId);
    console.log({ answer });

    await sendNotificationToEligibleLawyers({
      events: EVENT_IDENTIFIERS.RESPONSE.CREATED,
      lawyersToNotify: results,
    });
  });

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED, async ({ response }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED} event was received`);

    sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED,
      response,
      "RESPONSE",
      "MARK_AS_COMPLETED",
      "ownerId"
    );
  });
};
