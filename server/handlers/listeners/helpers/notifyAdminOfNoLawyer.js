import debug from "debug";
import { ROLES, TEMPLATE } from "../../../constants";
import userService from "../../../modules/users/service/user.service";

const logger = debug("app:handlers:listeners:helpers:notifyAdminOfNoLawyer");

export const notifyAdminOfNoLawyer = async (data, modelName) => {
  logger(`sending emails to admins for not finding a lawyer to notify of ${modelName}`);

  const admins = await userService.findMany({
    role: ROLES.ADMIN,
  });

  //send Notification to admins that no lawyer was found.

  // sendBulkTemplatedEmail(admins, TEMPLATE.NOTIFY_ADMIN, { ticketId: data.ticketId });
};
