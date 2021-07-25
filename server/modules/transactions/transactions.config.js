import { CommonRoutesConfig } from "../common/common.routes.config";
import TransactionsController from "./controllers/transaction.controller";
import { TransactionSchema, queryOptions } from "./schema/schema.transaction";
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
      ]);

    this.app
      .route(`${this.path}/transaction`)
      .get([
        Authenticate.verifyToken,
        middleware({ schema: queryOptions, property: "query" }),
        wrapCatch(TransactionsController.queryContext),
        wrapCatch(TransactionsController.getAllTransactions),
      ]);

    return this.app;
  }
}
