import { CommonRoutesConfig } from "../common/common.routes.config";
import RecipientsController from "./controller/recipient.controller";
import { createRecipientSchema, editRecipientSchema } from "./schema/recipient.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

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
      .delete([
        middleware({ schema: editRecipientSchema, property: "body" }),
        wrapCatch(RecipientsController.recipientExist()),
        wrapCatch(RecipientsController.deleteRecipient),
      ])
      .get([wrapCatch(RecipientsController.recipientExist("retrieve"))]);

    this.app
      .route(`${this.path}/recipients/bank_codes`)
      .all([Authenticate.verifyToken(), RecipientsController.checkAccessLawyer()])
      .get([wrapCatch(RecipientsController.getBankCodes)]);

    return this.app;
  }
}
