import debug from "debug";
import createError from "http-errors";

import ReportsService from "../services/reports.service";
import { paginate as pagination } from "../../helpers";

import { Op } from "sequelize";

const log = debug("app:reports-controller");

class ReportsController {
  static instance;
  static getInstance() {
    if (!ReportsController.instance) {
      ReportsController.instance = new ReportsController();
    }
    return ReportsController.instance;
  }

  async makeReport(req, res) {
    const { body, attachments = [] } = req;
    const reporterId = req.decodedToken.id;
    log(`creating a new report for user with id ${reporterId}`);
    const report = await ReportsService.create({ attachments, ...body, reporterId });

    return res.status(201).send({
      success: true,
      message: "report successfully created",
      report,
    });
  }

  reportExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that an report with id ${id} exits`);
      const report = await ReportsService.find(id, context);
      if (!report) return next(createError(404, "The report can not be found"));
      req.oldReport = report;
      return next();
    };
  }

  async modifyReport(req, res, next) {
    const {
      body,
      oldReport,
      params: { id },
    } = req;

    const [, [updatedReport]] = await ReportsService.update(id, body, oldReport);
    return res.status(200).send({
      success: true,
      message: "report successfully updated",
      report: updatedReport,
    });
  }

  async deleteReport(req, res, next) {
    const { id } = req.params;
    log(`deleting a report with id ${id}`);
    const deletedReport = await ReportsService.remove(id);
    return res.status(200).send({
      success: true,
      message: "report successfully deleted",
      report: deletedReport,
    });
  }

  getAReport(req, res, next) {
    const { oldReport } = req;
    return res.status(200).send({
      success: true,
      message: "report successfully retrieved",
      report: oldReport,
    });
  }

  async getAllReports(req, res, next) {
    log("getting all reports");
    const {
      filter,
      replacements,
      query: { paginate = {} },
    } = req;

    const reports = await ReportsService.findMany(filter, replacements, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "reports successfully retrieved",
      reports: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...reports,
      },
    });
  }

  async getAllReportsAdmin(req, res, next) {
    log("getting all reports for admin");
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const reports = await ReportsService.findManyAdmin(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "reports successfully retrieved",
      reports: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...reports,
      },
    });
  }

  queryContextAdmin(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    if (query.search && query.search.reporterId) {
      filter = { ...filter, reporterId: query.search.reporterId };
    }

    if (query.search && query.search.ticketId) {
      filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
    }

    req.filter = filter;
    return next();
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldReport: { reporterId },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role === "user" && id !== reporterId) {
        return next(createError(401, `You do not have access to ${context} this Report`));
      }
      return next();
    };
  }

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;

      console.log({ role }, "🦋");

      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(401, "You do not have permission to access this route"));
    };
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = "";
    let replacements = {};

    filter = filter
      ? `${filter} AND "Reports"."reporterId" = '${id}'`
      : `"Reports"."reporterId" = '${id}'`;

    replacements.reporterId = id;

    req.filter = filter;
    req.replacements = replacements;

    return next();
  }
}

export default ReportsController.getInstance();
