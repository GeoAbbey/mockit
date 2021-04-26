import { CommonRoutesConfig } from "../common/common.routes.config";
import CommentsController from "./controller/comments.controller";
import { createCommentSchema } from "./schema/comments.schema";
import { wrapCatch, middleware, Authenticate, validateUUID } from "../../utils";

export class CommentRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "CommentRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/comments/:id`)
      .all([Authenticate.verifyToken, middleware({ schema: validateUUID, property: "params" })])
      .post([
        middleware({ schema: createCommentSchema, property: "body" }),
        wrapCatch(CommentsController.makeComment),
      ])
      .get([CommentsController.queryContext, wrapCatch(CommentsController.getAllComments)]);

    this.app
      .route(`${this.path}/comment/:id`)
      .all([
        Authenticate.verifyToken,
        middleware({ schema: validateUUID, property: "params" }),
        CommentsController.commentExits(),
      ])
      .patch([
        middleware({ schema: createCommentSchema, property: "body" }),
        CommentsController.checkAccessUser("modify"),
        wrapCatch(CommentsController.modifyComment),
      ])
      .delete([
        CommentsController.checkAccessUser("delete"),
        wrapCatch(CommentsController.deleteComment),
      ])
      .get([wrapCatch(CommentsController.getAComment)]);
  }
}
