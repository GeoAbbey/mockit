import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import ResponsesService from "../services/response.services";
import AccountInfoServices from "../../accountInfo/services/accountInfo.services";
const log = debug("app:responses-controller");

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

const config = configOptions[env];

class ResponsesController {
  static instance;
  static getInstance() {
    if (!ResponsesController.instance) {
      ResponsesController.instance = new ResponsesController();
    }
    return ResponsesController.instance;
  }

  async makeResponse(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const {
      decodedToken,
      body: { longitude, latitude },
    } = req;
    const startingLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const ownerId = decodedToken.id;
    log(`creating a new response for user with id ${ownerId}`);
    const {
      dataValues: { subscriptionCount },
    } = await AccountInfoServices.find(ownerId);

    if (subscriptionCount < 1)
      return next(
        createError(
          401,
          "You don't have a subscription bundle to create an emergency response kindly purchase one"
        )
      );

    const response = await ResponsesService.create({ ownerId, startingLocation });

    eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.CREATED, {
      decodedToken,
      response,
      startingLocation,
      speed: config.averageSpeed,
    });
    return res.status(201).send({
      success: true,
      message: "1 subscription has been successfully used in creating this response",
      response,
    });
  }

  responseExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that a response with id ${id} exits`);
      const response = await ResponsesService.find(id, context);
      if (!response) return next(createError(404, "The response can not be found"));
      req.oldResponse = response;
      return next();
    };
  }

  async onGoingResponse(req, res, next) {
    const {
      decodedToken: { id },
    } = req;
    log(`checking that user with id ${id} doesn't have an ongoing emergency response`);

    const response = await ResponsesService.findInProgress(id);
    if (response) return next(createError(400, "You already have a response in progress"));

    return next();
  }

  async modifyResponse(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const io = req.app.get("io");

    const {
      body,
      oldResponse,
      decodedToken,
      params: { id },
    } = req;
    if (oldResponse.bid) {
      (body.assignedLawyerId = req.decodedToken.id), (body.status = "in-progress");
    }
    const [, [updatedResponse]] = await ResponsesService.update(id, body, oldResponse);

    if (body.bid)
      eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.ASSIGNED, {
        response: updatedResponse,
        decodedToken,
      });

    if (body.meetTime)
      eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.MEET_TIME, {
        response: updatedResponse,
        decodedToken,
        io,
      });

    return res.status(200).send({
      success: true,
      message: !oldResponse.bid
        ? "response successfully updated"
        : "You have been assigned this response",
      response: updatedResponse,
    });
  }

  async deleteResponse(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      decodedToken,
    } = req;

    log(`deleting an response with id ${id}`);
    const deletedResponse = await ResponsesService.remove(id);

    eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.DELETED, {
      decodedToken,
    });

    return res.status(200).send({
      success: true,
      message: "response successfully deleted and subscription used has been returned",
      response: deletedResponse,
    });
  }

  async getResponse(req, res, next) {
    const { oldResponse } = req;
    return res.status(200).send({
      success: true,
      message: "response successfully retrieved",
      response: oldResponse,
    });
  }

  async getUnassignedResponses(req, res, next) {
    log("getting all unassigned responses");
    const data = { where: { assignedLawyerId: null } };
    const responses = await ResponsesService.findMany(data, true);
    return res.status(200).send({
      success: true,
      message: "responses successfully retrieved",
      responses,
    });
  }

  async getAllResponses(req, res, next) {
    log("getting all Responses");
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const { offset, limit } = pagination(paginate);

    const responses = await ResponsesService.findMany(filter, paginate);
    return res.status(200).send({
      success: true,
      message: "responses successfully retrieved",
      responses: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...responses,
      },
    });
  }

  async getStats(req, res, next) {
    log("getting statistics for responses");

    const allStats = await ResponsesService.stats();
    return res.status(200).send({
      success: true,
      message: "responses statistics successfully retrieved",
      allStats,
    });
  }

  async marKAsCompleted(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      decodedToken,
      oldResponse,
    } = req;

    const [, [updatedResponse]] = await ResponsesService.update(
      id,
      { status: "completed" },
      oldResponse
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED, {
      response: updatedResponse,
      decodedToken,
    });

    return res.status(200).send({
      success: true,
      message: "You have successfully completed this response",
      response: updatedResponse,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        body,
        oldResponse: { ownerId, assignedLawyerId },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role === "lawyer" && context !== "retrieve")
        return next(createError(401, `You do not have access to ${context} this response`));
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this response`));
      }
      if (context === "retrieve") {
        if (role === "lawyer" && id !== assignedLawyerId)
          return next(createError(401, `You do not have access to ${context} this response`));
      }
      return next();
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldResponse,
        body: { bid, meetTime },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "markAsComplete" || meetTime) {
        if (id !== oldResponse.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
      }
      if (bid && oldResponse.assignedLawyerId)
        return next(createError(401, "A lawyer has already been assigned to this response"));
      else if (bid) {
        const { eligibleLawyers } = oldResponse;
        const found = eligibleLawyers.find((lawyer) => lawyer.dataValues.lawyerId === id);
        if (!found)
          return next(
            createError(
              401,
              "You can't bid for this response because you aren't within range to quickly respond"
            )
          );
        req.oldResponse.bid = bid;
      }

      return next();
    };
  }

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(401, "You do not have permission to access this route"));
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    const commonOptions = () => {
      if (query.search && query.search.status) {
        filter = { ...filter, status: query.search.status };
      }

      if (query.search && query.search.paid) {
        filter = { ...filter, paid: query.search.paid };
      }

      if (query.search && query.search.ticketId) {
        filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }
      commonOptions();

      if (query.search && query.search.assignedLawyerId) {
        filter = { ...filter, assignedLawyerId: query.search.assignedLawyerId };
      }
    }

    if (role === "lawyer") {
      filter = { ...filter, assignedLawyerId: id };
      commonOptions();
    }

    if (role === "user") {
      filter = { ...filter, ownerId: id };
      commonOptions();
    }

    req.filter = filter;
    return next();
  }
}

export default ResponsesController.getInstance();
