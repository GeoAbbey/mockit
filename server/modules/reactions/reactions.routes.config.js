import { CommonRoutesConfig } from "../common/common.routes.config";
import ReactionsController from "./controller/reactions.controllers";
import { allowedReactionSchema } from "./schema/reactions.schema";
import { wrapCatch, middleware, Authenticate, validateUUID, allowedModelSchema } from "../../utils";

export class ReactionRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "ReactionRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/reactions/:modelType/:reactionType/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: allowedReactionSchema, property: "params" }),
      ])
      .post([wrapCatch(ReactionsController.makeReaction)]);
    // .get([ReactionsController.queryContext, wrapCatch(ReactionsController.getAllReactions)]);

    // this.app
    //   .route(`${this.path}/reaction/:id`)
    //   .all([
    //     Authenticate.verifyToken(),
    //     middleware({ schema: validateUUID, property: "params" }),
    //     ReactionsController.reactionExits(),
    //   ])
    //   .patch([
    //     middleware({ schema: createReactionSchema, property: "body" }),
    //     ReactionsController.checkAccessUser("modify"),
    //     wrapCatch(ReactionsController.modifyReaction),
    //   ])
    //   .delete([
    //     ReactionsController.checkAccessUser("delete"),
    //     wrapCatch(ReactionsController.deleteReaction),
    //   ])
    //   .get([wrapCatch(ReactionsController.getAReaction)]);
  }
}
