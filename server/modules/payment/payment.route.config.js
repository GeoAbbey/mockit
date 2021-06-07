import { CommonRoutesConfig } from "../common/common.routes.config";
import PaymentsController from "./controllers/payment.controllers";
import {
  PaymentWithSubOrWalletSchema,
  PayInSchema,
  PaymentAuthCodeSchema,
} from "./schema/payment.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class PaymentRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "PaymentRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/payment-wallet-or-sub`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: PaymentWithSubOrWalletSchema, property: "body" }),
        wrapCatch(PaymentsController.walletOrSubPayment),
      ]);

    this.app
      .route(`${this.path}/payment/charge`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: PaymentAuthCodeSchema, property: "body" }),
        wrapCatch(PaymentsController.cardPayment),
      ]);

    this.app
      .route(`${this.path}/payment/verify/:ref`)
      .all([Authenticate.verifyToken])
      .get([wrapCatch(PaymentsController.processPayment)]);

    this.app
      .route(`${this.path}/payin-service-or-credit-account`)
      .all([Authenticate.verifyToken])
      .post([
        middleware({ schema: PayInSchema, property: "body" }),
        wrapCatch(PaymentsController.payInPayment),
      ]);

    return this.app;
  }
}
