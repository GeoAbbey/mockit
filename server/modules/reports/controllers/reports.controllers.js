import debug from "debug";
import createError from "http-errors";

import ReportsService from "../services/reports.service";
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
      next();
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

  async amplifyAReport(req, res, next) {
    log("re-posting a reports");
    const {
      decodedToken: { id: amplifierId },
      params: { id },
      oldReport,
    } = req;

    const [, [updatedReport]] = await ReportsService.update(id, { amplifierId }, oldReport);
    return res.status(200).send({
      success: true,
      message: "report successfully updated",
      report: updatedReport,
    });
  }

  async getAllReports(req, res, next) {
    log("getting all reports");
    const { data } = req;
    const reports = await ReportsService.findMany(data);
    return res.status(200).send({
      success: true,
      message: "reports successfully retrieved",
      reports,
    });
  }

  async reactToReport(req, res, next) {
    log("reacting to a reports");
    const {
      decodedToken: { id: reactorId },
      params: { id },
      oldReport,
    } = req;

    const [, [updatedReport]] = await ReportsService.update(id, { reactorId }, oldReport);
    return res.status(200).send({
      success: true,
      message: "report successfully updated",
      report: updatedReport,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldReport: { reporterId },
      } = req;
      if (role === "admin" || role === "super-admin") next();
      if (role === "user" && id !== reporterId) {
        return next(createError(401, `You do not have access to ${context} this Report`));
      }
      next();
    };
  }
}

export default ReportsController.getInstance();
