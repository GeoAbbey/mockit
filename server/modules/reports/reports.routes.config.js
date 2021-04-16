import { CommonRoutesConfig } from "../common/common.routes.config";
import ReportsController from "./controllers/reports.controllers";
import { createReportSchema, updateReportSchema } from "./schema/report.schema";
import { wrapCatch, middleware, Authenticate, validateUUID, uploadMiddleware } from "../../utils";

export class ReportRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "ReportRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/reports`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: createReportSchema, property: "body" }),
        uploadMiddleware,
        wrapCatch(ReportsController.makeReport),
      ])
      .get([wrapCatch(ReportsController.getAllReports)]);

    this.app
      .route(`${this.path}/report/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        ReportsController.reportExits(),
      ])
      .patch([
        middleware({ schema: updateReportSchema, property: "body" }),
        ReportsController.checkAccessUser("modify"),
        uploadMiddleware,
        wrapCatch(ReportsController.modifyReport),
      ])
      .put([wrapCatch(ReportsController.reactToReport)])
      .post([wrapCatch(ReportsController.amplifyAReport)])
      .delete([
        ReportsController.checkAccessUser("delete"),
        wrapCatch(ReportsController.deleteReport),
      ]);

    this.app
      .route(`${this.path}/report/:id`)
      .get([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        ReportsController.reportExits("retrieve"),
        wrapCatch(ReportsController.getAReport),
      ]);
  }
}
