import debug from "debug";

import InvitationsService from "../../../modules/invitations/service/invitations.service";
import SmallClaimsService from "../../../modules/small-claims/services/small-claims.service";
import ResponseServices from "../../../modules/response/services/response.services";

const logger = debug("app:handlers:listeners:helpers:updateModelInstance");

export const updateModelInstance = async (data, modelName) => {
  logger(`updating the isNotified variable of ${modelName}`);
  if (modelName === "INVITATION") {
    InvitationsService.update(data.id, { isNotified: true }, data);
  }

  if (modelName === "SMALL_CLAIM") {
    SmallClaimsService.update(data.id, { isNotified: true }, data);
  }

  if (modelName === "RESPONSE") {
    ResponseServices.update(data.id, { isNotified: true }, data);
  }
};
