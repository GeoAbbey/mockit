import { CommonRoutesConfig } from "../common/common.routes.config";
import ResponsesController from "./controllers/response.controller";
import { updateResponseSchema } from "./schema/response.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";
import { queryContextParams } from "../../utils/allPurpose.schema";

export class ResponseRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "ResponseRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/responses`)
      .all([Authenticate.verifyToken])
      .post([[wrapCatch(ResponsesController.makeResponse)]])
      .get([
        middleware({ schema: queryContextParams, property: "query" }),
        ResponsesController.queryContext,
        wrapCatch(ResponsesController.getAllResponses),
      ]);

    this.app
      .route(`${this.path}/response/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        ResponsesController.responseExits(),
      ])
      .post([
        ResponsesController.checkAccessLawyer("markAsComplete"),
        wrapCatch(ResponsesController.marKAsCompleted),
      ])
      .put([
        middleware({ schema: updateResponseSchema, property: "body" }),
        ResponsesController.checkAccessLawyer(),
        wrapCatch(ResponsesController.modifyResponse),
      ])
      .delete([
        ResponsesController.checkAccessUser("delete"),
        wrapCatch(ResponsesController.deleteResponse),
      ]);

    this.app
      .route(`${this.path}/response/:id`)
      .get([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        ResponsesController.responseExits("retrieve"),
        ResponsesController.checkAccessUser("retrieve"),
        wrapCatch(ResponsesController.getResponse),
      ]);
  }
}
