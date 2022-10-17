import debug from "debug";
import PaymentsService from "../../../modules/payment/services/payment.services";
import UserService from "../../../modules/users/service/user.service";
import { EVENT_IDENTIFIERS, ROLES, TEMPLATE } from "../../../constants";
import { schedule } from "../../../jobs/scheduler";
import { notifyAdminOfNoLawyer } from "../helpers/notifyAdminOfNoLawyer";
import { updateModelInstance } from "../helpers/updateModelInstance";
import { notifyPeople } from "../helpers/notifyPeople";
import { data } from "./data";
import { sendBulkMail, sendMail } from "../../../utils/MailService";

const logger = debug("server:handlers:listeners:invitationEvents");

export const invitationEvents = (eventEmitter) => {
  eventEmitter.on(
    EVENT_IDENTIFIERS.INVITATION.ADMIN_ASSIGN_LAWYER,
    async ({ invitation, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.INVITATION.ADMIN_ASSIGN_LAWYER} has been received`);
      const lawyerToken = await UserService.findByPk(invitation.assignedLawyerId);
      const userToken = await UserService.findByPk(invitation.ownerId);

      const notificationData = data.ASSIGNED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: invitation.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.INVITATION.ASSIGNED,
        people: [userToken, lawyerToken],
        notificationData,
      });
    }
  );

  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.CREATED, async ({ invitation, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.INVITATION.CREATED} has been received`);

    const notificationData = data.CREATED({
      sender_id: invitation.ownerId,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: invitation.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    const lawyers = await UserService.findMany({
      role: ROLES.LAWYER,
      address: { country: invitation.venue.country, state: invitation.venue.state },
    });

    if (!lawyers.length) notifyAdminOfNoLawyer(invitation, "INVITATION");
    else updateModelInstance(invitation, "INVITATION");

    notifyPeople({
      event: EVENT_IDENTIFIERS.INVITATION.CREATED,
      people: lawyers,
      notificationData,
    });

    const personalizations = lawyers.map((lawyer) => ({
      to: [{ email: lawyer.email }],
      dynamic_template_data: {
        firstName: lawyer.firstName,
      },
    }));

    sendBulkMail({ personalizations, templateId: TEMPLATE.POLICE_INVITATION_CREATED });
  });

  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.CANCELLED, async ({ invitation, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.INVITATION.CANCELLED} has been received`);

    eventEmitter.emit(EVENT_IDENTIFIERS.INVITATION.CREATED, {
      invitation,
      decodedToken,
    });
  });

  eventEmitter.on(EVENT_IDENTIFIERS.INVITATION.ASSIGNED, async ({ invitation, decodedToken }) => {
    logger(`${EVENT_IDENTIFIERS.INVITATION.ASSIGNED} has been received`);

    const userToken = await UserService.findByPk(invitation.ownerId);

    const notificationData = data.ASSIGNED({
      sender_id: decodedToken.id,
      sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
      status_id: invitation.id,
      sender_firebase_token: decodedToken.firebaseToken,
    });

    notifyPeople({
      event: EVENT_IDENTIFIERS.INVITATION.ASSIGNED,
      people: [userToken],
      notificationData,
    });

    sendMail({
      email: userToken.dataValues.email,
      templateId: TEMPLATE.INVITATION_LAWYER_ASSIGNED,
      firstName: userToken.dataValues.firstName,
    });
  });

  eventEmitter.on(
    EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED,
    async ({ invitation, decodedToken }) => {
      logger(`${EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED} has been received`);

      const userToken = await UserService.findByPk(invitation.ownerId);

      const notificationData = data.MARK_AS_COMPLETED({
        sender_id: decodedToken.id,
        sender_name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        status_id: invitation.id,
        sender_firebase_token: decodedToken.firebaseToken,
      });

      notifyPeople({
        event: EVENT_IDENTIFIERS.INVITATION.MARK_AS_COMPLETED,
        people: [userToken],
        notificationData,
      });
      sendMail({
        email: userToken.dataValues.email,
        templateId: TEMPLATE.POLICE_INVITATION_COMPLETED,
        firstName: userToken.dataValues.firstName,
      });

      const theData = {
        ...invitation.dataValues,
        type: "invitation",
      };

      const initializedPayout = await PaymentsService.initializePayout(theData);

      initializedPayout.success &&
        schedule.completePayout({ theModel: theData, lawyerInfo: decodedToken });

      console.log({ initializedPayout }, "🍅");
    }
  );
};
