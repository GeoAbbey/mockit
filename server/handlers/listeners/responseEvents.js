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

import RecipientsService from "../../modules/recipient/services/recipient.services";
import PayoutsController from "../../modules/payout/controllers/payout.controller";

import { schedule } from "../../jobs/scheduler";

const getAmount = PayoutsController.getAmount;

export const responseEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.ASSIGNED, async ({ response, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.ASSIGNED} event was received`);

    const {
      dataValues: { ownerId, assignedLawyerId },
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
          online: false,
        },
        userLocationDetails
      ),
      LocationServices.update(
        lawyerLocationDetails.id,
        {
          assigningId: null,
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

      // const userSocketDetails = await LocationServices.find({ where: { id: ownerId } });

      // io.to(userSocketDetails.dataValues.socketId).emit("on:surrounding:lawyers", {
      //   results,
      //   message: `Lawyers available within the given radius ${config.radius}`,
      // });

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
      const {
        dataValues: { assignedLawyerId, id, ownerId },
      } = response;

      const lawyerRecipientDetails = await RecipientsService.find(assignedLawyerId);

      const data = {
        recipient: lawyerRecipientDetails.dataValues.code,
        reason: JSON.stringify({
          modelType: "response",
          modelId: id,
          text: "payment made from mark as complete",
          id: ownerId,
          lawyerId: assignedLawyerId,
        }),
        amount: await getAmount("response"),
      };

      await schedule.createPayout(data);
    }
  );

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.DELETED, async ({ decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.DELETED} event was received`);

    await PaymentsService.returnSubscriptionCount({
      id: decodedToken.id,
    });
  });
};
