import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import ResponsesService from "../services/response.services";
const log = debug("app:responses-controller");

class ResponsesController {
  static instance;
  static getInstance() {
    if (!ResponsesController.instance) {
      ResponsesController.instance = new ResponsesController();
    }
    return ResponsesController.instance;
  }

  async makeResponse(req, res) {
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
    const response = await ResponsesService.create({ ownerId, startingLocation });

    eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.CREATED, { decodedToken, response });
    return res.status(201).send({
      success: true,
      message: "response successfully created",
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
      next();
    };
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
      });

    if (body.meetTime)
      eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.MEET_TIME, {
        response: updatedResponse,
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
    const { id } = req.params;
    log(`deleting an Response with id ${id}`);
    const deletedResponse = await ResponsesService.remove(id);
    return res.status(200).send({
      success: true,
      message: "response successfully deleted",
      response: deletedResponse,
    });
  }

  async getResponse(req, res, next) {
    const { oldResponse } = req;
    return res.status(200).send({
      success: true,
      message: "response successfully retrieved",
      Response: oldResponse,
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
    const { data } = req;
    const responses = await ResponsesService.findMany(data);
    return res.status(200).send({
      success: true,
      message: "responses successfully retrieved",
      responses,
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
      oldResponse,
    } = req;

    const [, [updatedResponse]] = await ResponsesService.update(
      id,
      { status: "completed" },
      oldResponse
    );

    eventEmitter.emit(EVENT_IDENTIFIERS.RESPONSE.MARK_AS_COMPLETED, {
      response: updatedResponse,
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
      if (role === "admin" || role === "super-admin") next();
      if (role === "lawyer" && context !== "retrieve")
        return next(createError(401, `You do not have access to ${context} this response`));
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this response`));
      }
      if (context === "retrieve") {
        if (role === "lawyer" && id !== assignedLawyerId)
          return next(createError(401, `You do not have access to ${context} this response`));
      }
      next();
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
    if (role === "admin" || role === "super-admin") {
      req.data = {};
      if (query) {
        req.data.where = {
          ...query,
        };
      }
    }
    if (role === "lawyer") {
      req.data = { where: { assignedLawyerId: id } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    return next();
  }
}

export default ResponsesController.getInstance();
