import { CommonRoutesConfig } from "../common/common.routes.config";
import TransactionsController from "./controllers/transaction.controller";
import { TransactionSchema } from "./schema/schema.transaction";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class TransactionRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "TransactionRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/transaction/:ownerId`)
      .all([
        Authenticate.verifyToken,
        TransactionsController.checkAccessAdmin(),
        middleware({ schema: validateUUID("ownerId"), property: "params" }),
      ])
      .get([wrapCatch(TransactionsController.getAllTransactions)])
      .post([
        middleware({ schema: TransactionSchema, property: "body" }),
        wrapCatch(TransactionsController.createTransaction),
      ]);

    this.app
      .route(`${this.path}/transaction/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID("id"), property: "params" }),
        TransactionsController.transactionExits(),
      ])
      .delete([
        TransactionsController.checkAccessAdmin(),
        wrapCatch(TransactionsController.deleteTransaction),
      ])
      .put([
        middleware({ schema: TransactionSchema, property: "body" }),
        TransactionsController.checkAccessAdmin(),
        wrapCatch(TransactionsController.modifyTransaction),
      ]);

    return this.app;
  }
}
