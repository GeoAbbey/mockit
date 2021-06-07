import { CommonRoutesConfig } from "../common/common.routes.config";
import RecipientsController from "./controller/recipient.controller";
import { createRecipientSchema } from "./schema/recipient.schema";
import { wrapCatch, middleware, Authenticate } from "../../utils";

export class RecipientRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "RecipientRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/recipients`)
      .all([Authenticate.verifyToken])
      .post([
        RecipientsController.checkAccessLawyer(),
        middleware({ schema: createRecipientSchema, property: "body" }),
        wrapCatch(RecipientsController.makeRecipient),
      ]);

    return this.app;
  }
}
