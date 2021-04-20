import { CommonRoutesConfig } from "../common/common.routes.config";
import ResponsesController from "./controllers/response.controller";
// import { createResponseSchema, updatedResponseSchema } from "./schema/response.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class ResponseRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "ResponseRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/responses`)
      .all([Authenticate.verifyToken])
      .post([
        // middleware({ schema: createResponseSchema, property: "body" }),
        [wrapCatch(ResponsesController.makeResponse)],
      ])
      .get([ResponsesController.queryContext, wrapCatch(ResponsesController.getAllResponses)]);

    this.app
      .route(`${this.path}/response/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        ResponsesController.responseExits(),
      ])
      .patch([
        // middleware({ schema: updatedResponseSchema, property: "body" }),
        ResponsesController.checkAccessUser("modify"),
        wrapCatch(ResponsesController.modifyResponse),
      ])
      .put([ResponsesController.checkAccessLawyer(), wrapCatch(ResponsesController.modifyInvite)])
      .post([
        ResponsesController.checkAccessLawyer("markAsComplete"),
        wrapCatch(ResponsesController.marKAsCompleted),
      ])
      .delete([
        ResponsesController.checkAccessUser("delete"),
        wrapCatch(ResponsesController.deleteInvite),
      ]);

    this.app
      .route(`${this.path}/response/:id`)
      .get([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        ResponsesController.responseExits("retrieve"),
        ResponsesController.checkAccessUser("retrieve"),
        wrapCatch(ResponsesController.getAnInvite),
      ]);
  }
}
