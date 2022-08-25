import { CommonRoutesConfig } from "../common/common.routes.config";
import PaymentsController from "./controllers/payment.controllers";
import {
  PaymentWithSubOrWalletSchema,
  PayInSchema,
  PaymentAuthCodeSchema,
  CooperateCode,
  queryOptions,
} from "./schema/payment.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";
import { paymentAuthMiddleware } from "./controllers/paymentAuth.js";

export class PaymentRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "PaymentRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/payment-wallet-or-sub`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: PaymentWithSubOrWalletSchema, property: "body" }),
        wrapCatch(PaymentsController.walletOrSubPayment),
      ]);

    this.app
      .route(`${this.path}/payment-wallet-or-sub/:code`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: CooperateCode, property: "params" }),
        middleware({ schema: PaymentWithSubOrWalletSchema, property: "body" }),
        wrapCatch(PaymentsController.walletOrSubPayment),
      ]);

    this.app
      .route(`${this.path}/payment/charge`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: PaymentAuthCodeSchema, property: "body" }),
        wrapCatch(paymentAuthMiddleware()),
        wrapCatch(PaymentsController.cardPayment),
      ]);

    this.app
      .route(`${this.path}/payment/verify/:ref`)
      .all([Authenticate.verifyToken()])
      .get([wrapCatch(paymentAuthMiddleware()), wrapCatch(PaymentsController.processPayment)]);

    this.app
      .route(`${this.path}/payin-service-or-credit-account`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: PayInSchema, property: "body" }),
        wrapCatch(paymentAuthMiddleware()),
        wrapCatch(PaymentsController.payInPayment),
      ]);

    this.app
      .route(`${this.path}/payin/history`)
      .get([
        Authenticate.verifyToken(),
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(PaymentsController.queryContext),
        wrapCatch(PaymentsController.payInHistory),
      ]);

    this.app
      .route(`${this.path}/payment/activity`)
      .get([Authenticate.verifyToken(), wrapCatch(PaymentsController.activityHistory)]);

    this.app
      .route(`${this.path}/payment/price-list`)
      .get([Authenticate.verifyToken(), wrapCatch(PaymentsController.priceList)]);

    return this.app;
  }
}
