import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";
import { rawQueries } from "../../../utils/rawQueriers";

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
            attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          },
          {
            model: models.User,
            as: "ownerProfile",
            attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          },
        ],
      });

      return invitation;
    }

    return models.Invitation.findByPk(id, t);
  }

  async findMany(data) {
    debugLog(`retrieving invitations with the following filter ${JSON.stringify(data)}`);
    return models.Invitation.findAll({
      order: [["createdAt", "DESC"]],
      ...data,
      include: [
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
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

    return models.Invitation.update(
      {
        status: invitationDTO.status || status,
        reason: invitationDTO.reason || reason,
        venue: invitationDTO.venue || venue,
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
