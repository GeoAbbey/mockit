import debug from "debug";
import createError from "http-errors";

import InvitationsService from "../service/invitations.service";
const log = debug("app:invitations-controller");

class InvitationsController {
  static instance;
  static getInstance() {
    if (!InvitationsController.instance) {
      InvitationsController.instance = new InvitationsController();
    }
    return InvitationsController.instance;
  }

  async makeInvite(req, res) {
    const { body } = req;
    const ownerId = req.decodedToken.id;
    log(`creating a new invitation for user with id ${ownerId}`);
    const invitation = await InvitationsService.create({ ...body, ownerId });

    return res.status(201).send({
      success: true,
      message: "invitation successfully created",
      invitation,
    });
  }
}

export default InvitationsController.getInstance();
