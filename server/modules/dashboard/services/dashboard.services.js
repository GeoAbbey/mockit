import debug from "debug";
import models from "../../../models";
import { QueryTypes } from "sequelize";

const debugLog = debug("server:modules:dashboard:services:dashboard.services.js");

class DashboardsService {
  static instance;
  static getInstance() {
    if (!DashboardsService.instance) {
      DashboardsService.instance = new DashboardsService();
    }
    return DashboardsService.instance;
  }

  async fulfilledAndPending(id) {
    debugLog(`looking for an auth code with id ${id}`);
    const filter = (model, id) => `WHERE "${model}"."assignedLawyerId" = '${id}'`;

    const invitations = await models.sequelize.query(
      `SELECT status, COUNT(*) FROM "Invitations" ${
        id ? filter("Invitations", id) : ""
      } GROUP BY status;`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    const responses = await models.sequelize.query(
      `SELECT status, COUNT(*) FROM "Responses" ${
        id ? filter("Responses", id) : ""
      } GROUP BY status;`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    const smallClaims = await models.sequelize.query(
      `SELECT status, COUNT(*) FROM "SmallClaims"  ${
        id ? filter("SmallClaims", id) : ""
      } GROUP BY status;`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    return { invitations, responses, smallClaims };
  }

  async histogramChat(filter) {
    debugLog(`retrieving records for dashboard histogram chat`);

    let duration;

    if (filter && filter.to && filter.from) {
      duration = (tableName) =>
        `SELECT date_trunc('month', "${tableName}"."createdAt") AS the_month, count(*) as monthly_total FROM "${tableName}" WHERE "${tableName}"."createdAt" BETWEEN '${filter.from}' AND '${filter.to}' GROUP BY the_month`;
    } else {
      duration = (tableName) =>
        `SELECT date_trunc('month', "${tableName}"."createdAt") AS the_month, count(*) as monthly_total FROM "${tableName}" GROUP BY the_month`;
    }

    const invitations = await models.sequelize.query(duration("Invitations"), {
      nest: true,
      type: QueryTypes.SELECT,
    });

    const responses = await models.sequelize.query(duration("Responses"), {
      nest: true,
      type: QueryTypes.SELECT,
    });

    const smallClaims = await models.sequelize.query(duration("SmallClaims"), {
      nest: true,
      type: QueryTypes.SELECT,
    });

    return { invitations, responses, smallClaims };
  }

  async totalDebitAndCredit(filter) {
    debugLog(
      `retrieving total debit and credit over the following period ${JSON.stringify(filter)}`
    );

    let duration = (tableName) => "";

    if (filter && filter.to && filter.from) {
      duration = (tableName) =>
        `WHERE "${tableName}"."createdAt" BETWEEN '${filter.from}' AND '${filter.to}';`;
    }

    const payIns = await models.sequelize.query(
      `SELECT SUM(amount) FROM "PayIns" ${duration("PayIns")}`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    const payOuts = await models.sequelize.query(
      `SELECT SUM(amount) FROM "Withdrawals" ${duration("Withdrawals")}`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    return { payIns, payOuts };
  }
}

export default DashboardsService.getInstance();
