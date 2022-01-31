import { CommonRoutesConfig } from "../common/common.routes.config";
import RecipientsController from "./controller/recipient.controller";
import { createRecipientSchema, recipientSchema } from "./schema/recipient.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";
import { paymentAuthMiddleware } from "../payment/controllers/paymentAuth";

export class RecipientRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "RecipientRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/recipients`)
      .all([Authenticate.verifyToken(), RecipientsController.checkAccessLawyer()])
      .post([
        middleware({ schema: createRecipientSchema, property: "body" }),
        wrapCatch(RecipientsController.makeRecipient),
      ])
      .get([wrapCatch(RecipientsController.getRecipients)]);

    this.app
      .route(`${this.path}/recipients/:code`)
      .all([Authenticate.verifyToken(), RecipientsController.checkAccessLawyer()])
      .delete([
        wrapCatch(RecipientsController.recipientExists),
        wrapCatch(RecipientsController.deleteRecipient),
      ]);

    this.app
      .route(`${this.path}/verify/recipients`)
      .all([Authenticate.verifyToken(), RecipientsController.checkAccessLawyer()])
      .post([
        middleware({ schema: recipientSchema, property: "body" }),
        wrapCatch(paymentAuthMiddleware()),
        wrapCatch(RecipientsController.verifyRecipient),
      ]);

    this.app
      .route(`${this.path}/recipients/bank_codes`)
      .all([
        Authenticate.verifyToken(),
        RecipientsController.checkAccessLawyer(),
        wrapCatch(paymentAuthMiddleware()),
      ])
      .get([wrapCatch(RecipientsController.getBankCodes)]);

    return this.app;
  }
}
