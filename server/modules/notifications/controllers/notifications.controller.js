import debug from "debug";

import NotificationsService from "../services/notification.services";
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
      decodedToken: { id: ownerId },
    } = req;
    const notifications = await NotificationsService.findMany(ownerId);
    return res.status(200).send({
      success: true,
      message: "notifications successfully retrieved",
      notifications,
    });
  }
}

export default NotificationsController.getInstance();
