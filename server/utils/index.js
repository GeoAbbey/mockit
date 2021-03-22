import { middleware } from "./middleware";
import { wrapCatch } from "./wrapCatch";
import HandlePassword from "./handlePassword";
import Authenticate from "./handleJwt";
import AccessControl from "./accessControl";
import { otp } from "./otp";
import { validateUUID } from "./validUUID";
import { sendMail, sendTemplateEmail } from "./MailService";
import { uploadMiddleware } from "./UploadService";

export {
  middleware,
  wrapCatch,
  Authenticate,
  HandlePassword,
  AccessControl,
  otp,
  validateUUID,
  sendMail,
  sendTemplateEmail,
  uploadMiddleware,
};
