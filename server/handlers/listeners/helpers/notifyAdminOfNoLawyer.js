import debug from "debug";
import { ROLES, TEMPLATE } from "../../../constants";
import models from "../../../models";
import { sendBulkTemplatedEmail } from "../../../utils/MailService";

const logger = debug("app:handlers:listeners:helpers:notifyAdminOfNoLawyer");

export const notifyAdminOfNoLawyer = async (data, modelName) => {
  logger(`sending emails to admins for not finding a lawyer to notify of ${modelName}`);

  const admins = await models.User.findAll({
    where: {
      role: ROLES.ADMIN,
    },
  });

  sendBulkTemplatedEmail(admins, TEMPLATE.NOTIFY_ADMIN, data.ticketId);
};
