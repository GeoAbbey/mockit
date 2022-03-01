import { CommonRoutesConfig } from "../common/common.routes.config";
import ResponsesController from "./controllers/response.controller";
import { updateResponseSchema, createResponseSchema, queryOptions } from "./schema/response.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";
import { queryContextParams } from "../../utils/allPurpose.schema";

export class ResponseRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "ResponseRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/responses`)
      .all([Authenticate.verifyToken()])
      .post([
        middleware({ schema: createResponseSchema, property: "body" }),
        wrapCatch(ResponsesController.onGoingResponse),
        wrapCatch(ResponsesController.makeResponse),
      ])
      .get([
        middleware({ schema: queryOptions, property: "query" }),
        ResponsesController.queryContext,
        wrapCatch(ResponsesController.getAllResponses),
      ]);

    this.app
      .route(`${this.path}/responses/unassigned`)
      .get([
        Authenticate.verifyToken(),
        ResponsesController.checkAccessLawyer(),
        wrapCatch(ResponsesController.getUnassignedResponses),
      ]);

    this.app
      .route(`${this.path}/responses/stats`)
      .get([
        Authenticate.verifyToken(),
        ResponsesController.checkAccessAdmin(),
        wrapCatch(ResponsesController.getStats),
      ]);

    this.app
      .route(`${this.path}/response/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        ResponsesController.responseExits(),
      ])
      .post([
        ResponsesController.checkAccessLawyer("markAsComplete"),
        wrapCatch(ResponsesController.marKAsCompleted),
      ])
      .delete([
        ResponsesController.checkAccessUser("delete"),
        wrapCatch(ResponsesController.deleteResponse),
      ]);

    this.app
      .route(`${this.path}/response/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        ResponsesController.responseExits("retrieve"),
      ])
      .get([
        ResponsesController.checkAccessUser("retrieve"),
        wrapCatch(ResponsesController.getResponse),
      ])
      .put([
        middleware({ schema: updateResponseSchema, property: "body" }),
        ResponsesController.checkAccessLawyer(),
        wrapCatch(ResponsesController.modifyResponse),
      ]);
  }
}
