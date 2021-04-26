import { middleware } from "./middleware";
import { wrapCatch } from "./wrapCatch";
import HandlePassword from "./handlePassword";
import Authenticate from "./handleJwt";
import AccessControl from "./accessControl";
import { otp } from "./otp";
import { validateUUID, allowedModelSchema } from "./allPurpose.schema";
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
  allowedModelSchema,
  sendMail,
  sendTemplateEmail,
  uploadMiddleware,
};
