import debug from "debug";
import { EVENT_IDENTIFIERS, TEMPLATE } from "../../../constants";
import LocationServices from "../../../modules/locationDetail/services/locationDetails.services";
import PaymentsService from "../../../modules/payment/services/payment.services";
import EligibleLawyersService from "../../../modules/eligibleLawyers/services/eligibleLawyers.services";
import UserService from "../../../modules/users/service/user.service";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config.js";
const config = configOptions[env];

import { sendNotificationToEligibleLawyers } from "../helpers";
const logger = debug("app:handlers:listeners:response-events");
import models from "../../../models";

import { schedule } from "../../../jobs/scheduler";
import { data } from "./data";
import { notifyPeople } from "../helpers/notifyPeople";
import { sendMail } from "../../../utils";

export const responseEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.ASSIGNED, async ({ response, io, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.ASSIGNED} event was received`);

    const {
      dataValues: { ownerId, assignedLawyerId, id },
    } = response;

    const userLocationDetails = await LocationServices.find({ where: { id: ownerId } });
    const lawyerLocationDetails = await LocationServices.find({ where: { id: assignedLawyerId } });

    try {
      return models.sequelize.transaction(async (t) => {
        await userLocationDetails.update(
          {
            assigningId: assignedLawyerId,
          },
          { transaction: t }
        );

        await lawyerLocationDetails.update(
          {
            assigningId: ownerId,
            currentResponseId: id,
          },
          { transaction: t }
        );
      });
    } catch (error) {
      console.log({ error });
    }

    const userToken = await UserService.findByPk(response.ownerId);

    const notificationData = data.ASSIGNED({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: response.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    io.to(userToken.LocationDetail.socketId).emit(
      EVENT_IDENTIFIERS.RESPONSE.ASSIGNED,
      notificationData
    );

    await notifyPeople({
      event: EVENT_IDENTIFIERS.RESPONSE.ASSIGNED,
      people: [userToken],
      notificationData,
    });

    sendMail({
      email: userToken.dataValues.email,
      templateId: TEMPLATE.RESPONSE_LAWYER_ASSIGNED,
      firstName: userToken.dataValues.firstName,
    });

    const lawyersThatCantRespond = await EligibleLawyersService.getLawyersForResponse(response.id);

    for (let lawyer of lawyersThatCantRespond) {
      if (lawyer.dataValues.lawyerProfile.id === decodedToken.id) continue;
      io.to(lawyer.dataValues.lawyerProfile.LocationDetail.socketId).emit(
        "response:already:accepted",
        {
          response,
          message: "the above response has already been accepted by another lawyer.",
        }
      );
    }
  });

  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.MEET_TIME, async ({ response, io, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.MEET_TIME} event was received`);

    const {
      dataValues: { ownerId },
    } = response;

    const userToken = await UserService.findByPk(response.ownerId);

    const [userLocationDetails, lawyerLocationDetails] = await Promise.all([
      LocationServices.find({ where: { id: ownerId } }),
    ]);

    const notificationData = data.MEET_TIME({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: response.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    io.to(userLocationDetails.dataValues.socketId).emit(
      EVENT_IDENTIFIERS.RESPONSE.MEET_TIME,
      notificationData
    );

    notifyPeople({
      event: EVENT_IDENTIFIERS.RESPONSE.MEET_TIME,
      people: [userToken],
      notificationData,
    });
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

      console.log({ results });

      const lawyerModifiedWithResponseId = [];

      results.forEach((result) => {
        lawyerModifiedWithResponseId.push({ lawyerId: result.id, responseId });
      });

      const answer = await EligibleLawyersService.bulkCreate(lawyerModifiedWithResponseId);

      await sendNotificationToEligibleLawyers({
        io,
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
        notes: "debit",
        type: "response",
      });
    }
  );

  eventEmitter.on(
    EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED,
    async ({ response, decodedToken, io }) => {
      logger(`${EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED} event was received`);

      const userToken = await UserService.findByPk(response.ownerId);

      const notificationData = data.MARK_AS_COMPLETED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: response.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED,
        people: [userToken],
        notificationData,
      });

      io.to(userToken.LocationDetail.socketId).emit(
        EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED,
        notificationData
      );

      const theData = {
        ...response.dataValues,
        type: "response",
      };

      const initializedPayout = await PaymentsService.initializePayout(theData);

      initializedPayout.success &&
        schedule.completePayout({ theModel: theData, lawyerInfo: decodedToken });

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
