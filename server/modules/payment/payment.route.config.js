import { CommonRoutesConfig } from "../common/common.routes.config";
import PaymentsController from "./controllers/payment.controllers";
import { PaymentSchema } from "./schema/payment.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class PaymentRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "PaymentRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/payment`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: PaymentSchema, property: "body" }),
        wrapCatch(PaymentsController.makePayment),
      ]);

    return this.app;
  }
}
