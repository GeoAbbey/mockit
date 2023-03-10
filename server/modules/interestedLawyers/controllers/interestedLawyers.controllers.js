import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";
import { paginate as pagination } from "../../helpers";
import smallClaimsService from "../../small-claims/services/small-claims.service";

import InterestedLawyersService from "../services/interestedLawyers.services";
const logger = debug("app:small-claims-controller");

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
    const io = req.app.get("io");

    const {
      params: { id },
      body: { serviceCharge },
      decodedToken: { id: lawyerId },
    } = req;

    logger(`creating an interest for lawyer with ID ${lawyerId} with ID ${id}`);

    const interest = await InterestedLawyersService.create({
      serviceCharge,
      lawyerId,
      claimId: id,
    });

    if (!interest) return next(createError(400, `The claim with id ${id} cannot be found`));

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.MARK_INTEREST, interest, req.decodedToken, io);

    return res.status(200).send({
      success: true,
      message: "You have successfully indicated interest in this small claim",
      interest,
    });
  }

  interestExits(context) {
    return async (req, res, next) => {
      const {
        params: { id: claimId },
        decodedToken: { id: lawyerId },
      } = req;
      if (context !== "create") {
        const interest = await InterestedLawyersService.find(req.params.id);
        if (!interest) return next(createError(404, "This interest can not be found"));
        req.oldInterest = interest;
        return next();
      } else {
        const interest = await InterestedLawyersService.findOne({ claimId, lawyerId });
        if (interest)
          return next(
            createError(403, `You can only indicate interest once per small claim with ${claimId}`)
          );
        return next();
      }
    };
  }

  async getAllInterest(req, res, next) {
    logger("getting all invitations");
    const {
      params: { id },
      query: { paginate = {} },
    } = req;

    const interests = await InterestedLawyersService.findMany(paginate, id);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "invitations successfully retrieved",
      interests: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...interests,
      },
    });
  }

  async editInterest(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");
    const io = req.app.get("io");

    const {
      params: { id },
      body,
      oldInterest,
      decodedToken,
    } = req;

    const { status } = await smallClaimsService.find(oldInterest.claimId, null);
    if (status === "lawyer_consent")
      return next(createError(400, "Can not edit interest once you have consented"));
    const [, [updatedInterest]] = await InterestedLawyersService.update(id, body, oldInterest);

    eventEmitter.emit(EVENT_IDENTIFIERS.SMALL_CLAIM.EDIT_INTEREST, {
      updatedInterest,
      oldInterest,
      decodedToken,
      io,
    });

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
