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

    // const { body } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new response for user with id ${ownerId}`);
    const response = await ResponsesService.create({ ownerId });

    // eventEmitter.emit(EVENT_IDENTIFIERS.Response.CREATED, Response);
    return res.status(201).send({
      success: true,
      message: "Response successfully created",
      response,
    });
  }

  responseExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that an Response with id ${id} exits`);
      const Response = await ResponsesService.find(id, context);
      if (!Response) return next(createError(404, "The Response can not be found"));
      req.oldResponse = Response;
      next();
    };
  }

  async modifyInvite(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

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

    if (oldResponse.bid)
      eventEmitter.emit(EVENT_IDENTIFIERS.Response.ASSIGNED, {
        Response: updatedResponse,
      });

    return res.status(200).send({
      success: true,
      message: !oldResponse.bid
        ? "Response successfully updated"
        : "You have been assigned this Response",
      Response: updatedResponse,
    });
  }

  async deleteInvite(req, res, next) {
    const { id } = req.params;
    log(`deleting an Response with id ${id}`);
    const deletedResponse = await ResponsesService.remove(id);
    return res.status(200).send({
      success: true,
      message: "Response successfully deleted",
      Response: deletedResponse,
    });
  }

  getAnInvite(req, res, next) {
    const { oldResponse } = req;
    return res.status(200).send({
      success: true,
      message: "Response successfully retrieved",
      Response: oldResponse,
    });
  }

  async getAllResponses(req, res, next) {
    log("getting all Responses");
    const { data } = req;
    const Responses = await ResponsesService.findMany(data);
    return res.status(200).send({
      success: true,
      message: "Responses successfully retrieved",
      Responses,
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

    eventEmitter.emit(EVENT_IDENTIFIERS.Response.MARK_AS_COMPLETED, {
      Response: updatedResponse,
    });

    return res.status(200).send({
      success: true,
      message: "You have successfully completed this Response",
      Response: updatedResponse,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        body,
        oldResponse: { ownerId, status },
      } = req;
      if (role === "admin" || role === "super-admin") next();
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this Response`));
      }
      if (role === "user" && id === ownerId && body.assignedLawyerId)
        return next(createError(403, "you can't assign a lawyer to yourself"));
      if (context !== "retrieve") {
        if (role === "user" && status !== "initiated")
          return next(
            createError(401, `You can't ${context} an Response once it has been assigned`)
          );
      }
      next();
    };
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldResponse,
      } = req;
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "markAsComplete") {
        if (id !== oldResponse.assignedLawyerId)
          return next(createError(401, "You do not have access to perform this operation"));
      }
      req.oldResponse.bid = true;
      next();
    };
  }

  queryContext(req, res, next) {
    const { role, id } = req.decodedToken;
    if (role === "admin" || role === "super-admin") {
      req.data = {};
    }
    if (role === "lawyer") {
      req.data = { where: { assignedLawyerId: id } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    next();
  }
}

export default ResponsesController.getInstance();
