import debug from "debug";
import models from "../../../models";
import { paginate } from "../../helpers";

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

  async findMany(filter, pageDetails) {
    debugLog(`retrieving notifications with the following filter ${JSON.stringify(filter)}`);
    return models.Notification.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
      ...paginate(pageDetails),
      include: [
        {
          model: models.User,
          as: "profile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken"],
        },
      ],
    });
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
