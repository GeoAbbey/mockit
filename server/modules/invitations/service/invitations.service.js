import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";
import { rawQueries } from "../../../utils/rawQueriers";
import { paginate } from "../../helpers";

const debugLog = debug("app:invitations-service");

class InvitationsService {
  static instance;
  static getInstance() {
    if (!InvitationsService.instance) {
      InvitationsService.instance = new InvitationsService();
    }
    return InvitationsService.instance;
  }

  async create(invitationDTO) {
    debugLog("creating an invitation");
    return models.Invitation.create(invitationDTO);
  }

  async find(id, context, t = undefined) {
    debugLog(`looking for an invitation with id ${id}`);
    if (context) {
      const invitation = await models.Invitation.findByPk(id, {
        include: [
          {
            model: models.Review,
            as: "reviews",
            where: { modelType: "Invitation", modelId: id },
            required: false,
          },
          {
            model: models.User,
            as: "lawyerProfile",
            attributes: [
              "firstName",
              "lastName",
              "email",
              "profilePic",
              "firebaseToken",
              "phone",
              "description",
            ],
            required: false,
          },
          {
            model: models.User,
            as: "ownerProfile",
            attributes: [
              "firstName",
              "lastName",
              "email",
              "profilePic",
              "firebaseToken",
              "phone",
              "description",
            ],
            required: false,
            include: [
              {
                model: models.PayIn,
                as: "oneTimePayments",
                where: { for: "singleInvitation", modelId: id },
                attributes: ["amount"],
                required: false,
              },
              {
                model: models.Transaction,
                as: "paymentFromWallet",
                where: { modelType: "invitation", modelId: id },
                attributes: ["amount"],
                required: false,
              },
            ],
          },
        ],
      });

      return invitation;
    }

    return models.Invitation.findByPk(id, t);
  }

  async findMany(filter, pageDetails) {
    debugLog(`retrieving invitations with the following filter ${JSON.stringify(filter)}`);
    return models.Invitation.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
      ...paginate(pageDetails),
      include: [
        {
          model: models.User,
          as: "ownerProfile",
          attributes: [
            "firstName",
            "lastName",
            "email",
            "profilePic",
            "firebaseToken",
            "phone",
            "description",
          ],
          required: false,
        },
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: [
            "firstName",
            "lastName",
            "email",
            "profilePic",
            "firebaseToken",
            "phone",
            "description",
          ],
          required: false,
        },
      ],
    });
  }

  async update(id, invitationDTO, oldInvitation, t = undefined) {
    const {
      status,
      reason,
      venue,
      attachments,
      assignedLawyerId,
      dateOfVisit,
      paid,
    } = oldInvitation;
    const handleAttachments = () => {
      if (typeof invitationDTO.attachments === "number") {
        attachments.splice(invitationDTO.attachments, 1);
        return attachments;
      }
      if (invitationDTO.attachments) {
        return [...new Set([...attachments, ...invitationDTO.attachments])];
      }
      return attachments;
    };

    const handleAddresses = (recent, old) => ({
      country: recent.country || old.country,
      state: recent.state || old.state,
      residence: recent.residence || old.residence,
    });

    return models.Invitation.update(
      {
        status: invitationDTO.status || status,
        reason: invitationDTO.reason || reason,
        venue: invitationDTO.venue && handleAddresses(invitationDTO.venue, venue),
        paid: handleFalsy(invitationDTO.paid, paid),
        dateOfVisit: invitationDTO.dateOfVisit || dateOfVisit,
        attachments: handleAttachments(),
        assignedLawyerId: invitationDTO.assignedLawyerId || assignedLawyerId,
      },
      { where: { id }, returning: true, ...t }
    );
  }

  async remove(id) {
    debugLog(`deleting the invitation with id ${id}`);
    return models.Invitation.destroy({
      where: { id, assignedLawyerId: null },
    });
  }

  async stats() {
    return models.sequelize.query(rawQueries.statistics("Invitations"), {
      type: QueryTypes.SELECT,
    });
  }
}

export default InvitationsService.getInstance();
