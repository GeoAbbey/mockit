import debug from "debug";
import createError from "http-errors";
import { pgDateFormate } from "../../../utils/pgFormateDate";

import DashboardsService from "../services/dashboard.services";
const log = debug("dashboard:services:dashboard.services");

class DashboardsController {
  static instance;
  static getInstance() {
    if (!DashboardsController.instance) {
      DashboardsController.instance = new DashboardsController();
    }
    return DashboardsController.instance;
  }

  async getHistogram(req, res, next) {
    log(`retrieving data for histogram`);

    const dataSet = await DashboardsService.histogramChat();

    return res.status(200).send({
      success: true,
      message: "data successfully retrieved",
      dataSet,
    });
  }

  async cashInAndOut(req, res, next) {
    log(`retrieving data for cash in and out of the system`);
    const { filter } = req;

    const dataSet = await DashboardsService.totalDebitAndCredit(filter);

    return res.status(200).send({
      success: true,
      message: "data successfully retrieved",
      dataSet,
    });
  }

  async getFulfilled(req, res, next) {
    log(`retrieving data for histogram and fulfilled`);
    const {
      query: { search },
    } = req;

    let dataSet;

    if (search && search.assignedLawyerId)
      dataSet = await DashboardsService.fulfilledAndPending(search.assignedLawyerId);
    else dataSet = await DashboardsService.fulfilledAndPending(null);

    return res.status(200).send({
      success: true,
      message: "data successfully retrieved",
      dataSet,
    });
  }

  async dateOptions(req, res, next) {
    log(`retrieving data for payIn and payOut`);
    const {
      query: { to, from },
    } = req;

    if (to && from) {
      req.filter = {
        to: pgDateFormate(to),
        from: pgDateFormate(from),
      };
    }

    return next();
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
}

export default DashboardsController.getInstance();
