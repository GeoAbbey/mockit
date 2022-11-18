import debug from "debug";
import { paginate as pagination } from "../../helpers";

import NotificationsService from "../services/notification.services";
import { Op } from "sequelize";
import sequelize from "sequelize";

const log = debug("app:notifications-controller");

class NotificationsController {
  static instance;
  static getInstance() {
    if (!NotificationsController.instance) {
      NotificationsController.instance = new NotificationsController();
    }
    return NotificationsController.instance;
  }

  async modifyNotificationsAsSeen(req, res, next) {
    const {
      body: { ids },
    } = req;

    const [result] = await NotificationsService.update(ids);
    return res.status(200).send({
      success: true,
      message: "notifications successfully updated",
      numOfNotificationsUpdated: result,
    });
  }

  async getAllNotifications(req, res, next) {
    log("getting all Notifications");
    const {
      filter,
      query: { paginate = {} },
    } = req;

    const notifications = await NotificationsService.findMany(filter, paginate);

    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "notifications successfully retrieved",
      notifications: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...notifications,
      },
    });
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    const commonOptions = () => {
      if (query.search && query.search.for) {
        filter = { ...filter, for: { [Op.iLike]: `%${query.search.for}%` } };
      }

      if (query.search && query.search.status_id) {
        filter = {
          ...filter,
          content: sequelize.literal(
            `"Notification".content @> '{"data": {"status_id": "${query.search.status_id}"}}'`
          ),
        };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }

      commonOptions();
    }

    if (role === "user" || role === "lawyer") {
      filter = { ...filter, ownerId: id };

      commonOptions();
    }

    req.filter = filter;
    return next();
  }
}

export default NotificationsController.getInstance();
