import debug from "debug";
import { EVENT_IDENTIFIERS, NOTIFICATION_DATA } from "../../constants";
import UserService from "../../modules/users/service/user.service";
import { Authenticate } from "../../utils";

import {
  sendNotificationToLawyers,
  sendNotificationToUserOrLawyer,
  layerMarkInterestForClaim,
} from "./helpers";
const logger = debug("app:handlers:listeners:small-claim-events");

export const responseEvents = (eventEmitter) => {
  eventEmitter.on(EVENT_IDENTIFIERS.RESPONSE.CREATED, async ({ decodedToken, response }) => {
    logger(`${EVENT_IDENTIFIERS.RESPONSE.CREATED} event was received`);

    const [, [modifiedUser]] = await UserService.update(
      decodedToken.id,
      { responseDetails: { online: true, socketId: "indianapolice" } },
      decodedToken
    );
    const token = await Authenticate.signToken(modifiedUser.dataValues);
    console.log({ token });
    //send socket event with new user token

    //send notification to all lawyer that are online. This will be re calculated to distance.
  });
};
