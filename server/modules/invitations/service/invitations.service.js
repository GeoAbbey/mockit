import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";

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

  async find(id, context) {
    debugLog(`looking for an invitation with id ${id}`);
    if (context) {
      const invitation = await models.Invitation.findByPk(id, {
        include: [
          {
            model: models.Review,
            as: "invitation-reviews",
            where: { modelType: "Invitation", modelId: id },
            required: false,
          },
        ],
      });

      return invitation;
    }

    return models.Invitation.findByPk(id);
  }

  async findMany(data) {
    debugLog(`retrieving invitations with the following filter ${JSON.stringify(data)}`);
    return models.Invitation.findAll(data);
  }

  async update(id, invitationDTO, oldInvitation) {
    const { status, reason, venue, attachments, assignedLawyerId } = oldInvitation;
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
        attachments: handleAttachments(),
        assignedLawyerId: invitationDTO.assignedLawyerId || assignedLawyerId,
      },
      { where: { id }, returning: true }
    );
  }

  async remove(id) {
    debugLog(`deleting the invitation with id ${id}`);
    return models.Invitation.destroy({
      where: { id, assignedLawyerId: null },
    });
  }
}

export default InvitationsService.getInstance();
