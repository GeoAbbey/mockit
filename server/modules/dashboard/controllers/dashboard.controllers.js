import debug from "debug";
import createError from "http-errors";

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

  async getFulfilled(req, res, next) {
    log(`retrieving data for histogram and fulfilled`);
    const {
      query: { search },
    } = req;

    let dataSet;

    if (search && search.assignedLawyerId)
      dataSet = await DashboardsService.fulfilledAndPending(assignedLawyerId);
    else dataSet = await DashboardsService.fulfilledAndPending(null);

    return res.status(200).send({
      success: true,
      message: "data successfully retrieved",
      dataSet,
    });
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
