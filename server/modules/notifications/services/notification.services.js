import debug from "debug";
import { Op } from "sequelize";
import models from "../../../models";

const debugLog = debug("app:notifications-service");

class NotificationsService {
  static instance;
  static getInstance() {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  async bulkCreate(NotificationDTO) {
    debugLog("creating a notification");
    return models.Notification.bulkCreate(NotificationDTO);
  }

  async findMany(id) {
    debugLog(`retrieving notifications with the following filter id ${id}`);
    return models.Notification.findAll({ where: { ownerId: id } });
  }

  async update(ids) {
    debugLog(`marking notifications with the following ids ${ids} as seen`);
    return models.Notification.update(
      {
        seen: true,
      },
      {
        where: {
          id: [...ids],
        },
      }
    );
  }
}

export default NotificationsService.getInstance();
