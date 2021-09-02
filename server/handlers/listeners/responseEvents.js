import debug from "debug";
import { EVENT_IDENTIFIERS } from "../../constants";
import LocationServices from "../../modules/locationDetail/services/locationDetails.services";
import PaymentsService from "../../modules/payment/services/payment.services";
import EligibleLawyersService from "../../modules/eligibleLawyers/services/eligibleLawyers.services";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../config/config.js";
const config = configOptions[env];

import { sendNotificationToUserOrLawyer, sendNotificationToEligibleLawyers } from "./helpers";
const logger = debug("app:handlers:listeners:response-events");

import { schedule } from "../../jobs/scheduler";

export const responseEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.ASSIGNED, async ({ response, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.ASSIGNED} event was received`);

    const {
      dataValues: { ownerId, assignedLawyerId, id },
    } = response;

    const [userLocationDetails, lawyerLocationDetails] = await Promise.all([
      LocationServices.find({ where: { id: ownerId } }),
      LocationServices.find({ where: { id: assignedLawyerId } }),
    ]);

    const [[, updatedUserDetails], [, updatedLawyerDetails]] = await Promise.all([
      LocationServices.update(
        userLocationDetails.dataValues.id,
        {
          assigningId: assignedLawyerId,
        },
        userLocationDetails
      ),
      LocationServices.update(
        lawyerLocationDetails.dataValues.id,
        {
          assigningId: ownerId,
          currentResponseId: id,
        },
        lawyerLocationDetails
      ),
    ]);

    await sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.RESPONSE.ASSIGNED,
      response,
      decodedToken,
      "RESPONSE",
      "ASSIGNED",
      "ownerId"
    );
  });

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.MEET_TIME, async ({ response, io, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.MEET_TIME} event was received`);

    const {
      dataValues: { ownerId, assignedLawyerId },
    } = response;

    const [userLocationDetails, lawyerLocationDetails] = await Promise.all([
      LocationServices.find({ where: { id: ownerId } }),
      LocationServices.find({ where: { id: assignedLawyerId } }),
    ]);

    const [[, [updatedUserDetails]], [, [updatedLawyerDetails]]] = await Promise.all([
      LocationServices.update(
        userLocationDetails.id,
        {
          assigningId: null,
          currentResponseId: null,
          online: false,
        },
        userLocationDetails
      ),
      LocationServices.update(
        lawyerLocationDetails.id,
        {
          assigningId: null,
          currentResponseId: null,
        },
        lawyerLocationDetails
      ),
    ]);

    io.to(updatedUserDetails.dataValues.socketId).emit("on:meet", {
      response,
      message: "lawyer has acknowledged that he has meet with you.",
    });

    await sendNotificationToUserOrLawyer(
      EVENT_IDENTIFIERS.RESPONSE.MEET_TIME,
      response,
      decodedToken,
      "RESPONSE",
      "MEET_TIME",
      "ownerId"
    );
  });

  eventEmitter.on(
    EVENT_IDENTIFIERS.RESPONSE.CREATED,
    async ({ response, decodedToken, startingLocation, speed, io }) => {
      logger(`${EVENT_IDENTIFIERS.RESPONSE.CREATED} event was received`);
      const {
        dataValues: { id: responseId, ownerId },
        startingLocation: { coordinates },
      } = response;

      //log user online
      const userDetails = await LocationServices.findByPk(ownerId);

      await LocationServices.update(
        userDetails.id,
        {
          online: true,
          currentResponseId: responseId,
        },
        userDetails
      );

      //return all the lawyers that are online and aren't busy within the given radius
      const results = await LocationServices.findLawyersWithinRadius({
        longitude: coordinates[0],
        latitude: coordinates[1],
        radius: config.radius,
      });

      logger({ results }, "🐥");
      const lawyerModifiedWithResponseId = [];

      results.forEach((result) => {
        lawyerModifiedWithResponseId.push({ lawyerId: result.id, responseId });
      });

      const answer = await EligibleLawyersService.bulkCreate(lawyerModifiedWithResponseId);

      await sendNotificationToEligibleLawyers({
        events: EVENT_IDENTIFIERS.RESPONSE.CREATED,
        lawyersToNotify: results,
        startingLocation: JSON.stringify(startingLocation),
        response,
        speed,
        decodedToken,
      });

      await PaymentsService.handleResponse({
        id: ownerId,
        modelId: responseId,
        modelType: "response",
      });
    }
  );

  eventEmitter.on(
    EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED,
    async ({ response, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED} event was received`);

      sendNotificationToUserOrLawyer(
        EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED,
        response,
        decodedToken,
        "RESPONSE",
        "MARK_AS_COMPLETED",
        "ownerId"
      );

      const data = {
        ...response.dataValues,
        type: "response",
      };

      const initializedPayout = await PaymentsService.initializePayout(data);

      initializedPayout.success && schedule.completePayout(data);

      console.log({ initializedPayout }, "🍅");
    }
  );

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.DELETED, async ({ decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.DELETED} event was received`);

    await PaymentsService.returnSubscriptionCount({
      id: decodedToken.id,
    });
  });
};
