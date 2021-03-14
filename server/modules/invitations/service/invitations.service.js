import debug from "debug";

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
    console.log({ invitationDTO }, "😆");
    return models.Invitation.create(invitationDTO);
  }
}

export default InvitationsService.getInstance();
