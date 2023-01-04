import debug from "debug";
import createError from "http-errors";
import { pgDateFormate } from "../../../utils/pgFormateDate";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

import PayInServices from "../services/pay-in.services";
const log = debug("app:PayIn-controller");

class PayInController {
  static instance;
  static getInstance() {
    if (!PayInController.instance) {
      PayInController.instance = new PayInController();
    }
    return PayInController.instance;
  }

  async getAllPayIns(req, res, next) {
    log("getting all pay ins");
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const invitations = await PayInServices.findMany(filter, paginate);
    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "invitations successfully retrieved",
      invitations: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...invitations,
      },
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

  queryContext(req, res, next) {
    const { query } = req;

    let filter = {};

    if (query.search && query.search.ticketId) {
      filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
    }

    if (query.search && query.search.type) {
      filter = { ...filter, for: query.search.for };
    }

    if (query.search && query.search.ownerId) {
      filter = { ...filter, ownerId: query.search.ownerId };
    }

    if (query.search && query.search.reference) {
      filter = { ...filter, reference: query.search.reference };
    }

    if (query.search && query.search.to && query.search.from) {
      filter = {
        ...filter,
        createdAt: {
          [Op.between]: [pgDateFormate(query.search.from), pgDateFormate(query.search.to)],
        },
      };
    }
    req.filter = filter;
    return next();
  }
}

export default PayInController.getInstance();
