import debug from "debug";
import createError from "http-errors";

import EligibleLawyersService from "../services/eligibleLawyers.services";
const log = debug("app:eligibleLawyers-controller");

class EligibleLawyersController {
  static instance;
  static getInstance() {
    if (!EligibleLawyersController.instance) {
      EligibleLawyersController.instance = new EligibleLawyersController();
    }
    return EligibleLawyersController.instance;
  }

  async makeEligibleLawyer(req, res) {
    const {
      body: { responseId, lawyerId },
    } = req;
    log(`creating an eligible lawyer for response with id ${responseId}`);
    const eligibleLawyer = await EligibleLawyersService.create({
      responseId,
      lawyerId,
    });

    return res.status(201).send({
      success: true,
      message: "eligible lawyer successfully created",
      eligibleLawyer,
    });
  }

  eligibleLawyerExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that a EligibleLawyer with id ${id} exits`);
      const eligibleLawyer = await EligibleLawyersService.find(id, context);
      if (!eligibleLawyer) return next(createError(404, "The eligible lawyer can not be found"));
      req.oldEligibleLawyer = eligibleLawyer;
      next();
    };
  }

  async deleteEligibleLawyer(req, res, next) {
    const {
      params: { id },
      filter = {},
    } = req;
    log(`deleting an eligible lawyer  entry for responseId ${id}`);
    const deletedEligibleLawyer = await EligibleLawyersService.remove(id, filter);
    return res.status(200).send({
      success: true,
      message: "eligible lawyer successfully deleted",
      eligibleLawyer: deletedEligibleLawyer,
    });
  }

  async getAllEligibleLawyers(req, res, next) {
    log("getting all eligible lawyers");
    const { data } = req;
    const eligibleLawyers = await EligibleLawyersService.findMany(data);
    return res.status(200).send({
      success: true,
      message: "eligible Lawyer successfully retrieved",
      eligibleLawyers,
    });
  }

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      else if (role === "lawyer") {
        req.filter = { lawyerId: id };
        return next();
      } else return next(createError(400, "You don not have permission to access this route"));
    };
  }

  queryContext(req, res, next) {
    const { query } = req;

    req.data = {};
    if (query) {
      req.data.where = {
        ...query,
      };
    }

    return next();
  }
}

export default EligibleLawyersController.getInstance();
