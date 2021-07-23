import { CommonRoutesConfig } from "../common/common.routes.config";
import NotificationsController from "./controllers/notifications.controller";
import { wrapCatch, middleware, Authenticate } from "../../utils";
import { validNotificationUUIDs, queryOptions } from "./schema/notification.schema";

export class NotificationRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "NotificationRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/notifications`)
      .all([Authenticate.verifyToken])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(NotificationsController.queryContext),
        wrapCatch(NotificationsController.getAllNotifications),
      ])
      .put([
        middleware({ schema: validNotificationUUIDs, property: "body" }),
        wrapCatch(NotificationsController.modifyNotificationsAsSeen),
      ]);
  }
}
