import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import InterestedLawyersService from "../services/interestedLawyers.services";
const log = debug("app:small-claims-controller");

class InterestedLawyersController {
  static instance;
  static getInstance() {
    if (!InterestedLawyersController.instance) {
      InterestedLawyersController.instance = new InterestedLawyersController();
    }
    return InterestedLawyersController.instance;
  }

  async marKInterest(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id, modelType },
      body: { baseCharge, serviceCharge },
      decodedToken: { id: lawyerId },
    } = req;

    const interest = await InterestedLawyersService.create({
      baseCharge,
      serviceCharge,
      lawyerId,
      modelType,
      modelId: id,
    });

    if (!interest) return next(createError(400, `The ${modelType} with id ${id} cannot be found`));

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, interest);

    return res.status(200).send({
      success: true,
      message: "You have successfully indicated interest in this small claim",
      interest,
    });
  }

  interestExits(context) {
    return async (req, res, next) => {
      const {
        params: { id: modelId, modelType },
        decodedToken: { id: lawyerId },
      } = req;
      if (context !== "create") {
        const interest = await InterestedLawyersService.find(req.params.id);
        if (!interest) return next(createError(404, "This interest can not be found"));
        req.oldInterest = interest;
        return next();
      } else {
        const interest = await InterestedLawyersService.findOne({ modelId, modelType, lawyerId });
        if (interest)
          return next(
            createError(403, `You can only indicate interest once per ${modelType} with ${modelId}`)
          );
        return next();
      }
    };
  }

  async editInterest(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { id },
      body,
      oldInterest,
    } = req;

    const [, [updatedInterest]] = await InterestedLawyersService.update(id, body, oldInterest);

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, updatedInterest);

    return res.status(200).send({
      success: true,
      message: "You have successfully indicated interest in this small claim",
      interest: updatedInterest,
    });
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldInterest,
      } = req;
      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));
      if (context === "edit") {
        if (oldInterest.lawyerId !== id)
          return next(createError(401, "You do not have access to perform this operation"));
      }
      next();
    };
  }
}

export default InterestedLawyersController.getInstance();
