import { CommonRoutesConfig } from "../common/common.routes.config";
import ReviewsController from "./controller/reviews.controller";
import { createReviewSchema, updateReviewSchema, queryReviewSchema } from "./schema/reviews.schema";

import { wrapCatch, middleware, Authenticate, validateUUID, allowedModelSchema } from "../../utils";

export class ReviewsRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "ReviewsRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/review/:modelType/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: allowedModelSchema, property: "params" }),
      ])
      .post([
        middleware({ schema: createReviewSchema, property: "body" }),
        ReviewsController.reviewExits("create"),
        wrapCatch(ReviewsController.makeReview),
      ])
      .get([wrapCatch(ReviewsController.getAssociatedReviews)]);

    this.app
      .route(`${this.path}/review/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
        ReviewsController.reviewExits(),
      ])
      .get([wrapCatch(ReviewsController.getSpecificReview)])
      .delete([
        ReviewsController.checkAccessUser("delete"),
        wrapCatch(ReviewsController.deleteReview),
      ])
      .patch([
        middleware({ schema: updateReviewSchema, property: "body" }),
        ReviewsController.checkAccessUser("modify"),
        wrapCatch(ReviewsController.editReview),
      ]);

    this.app
      .route(`${this.path}/reviews`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: queryReviewSchema, property: "query" }),
      ])
      .get([ReviewsController.queryContext, wrapCatch(ReviewsController.getAllReviews)]);

    this.app
      .route(`${this.path}/reviews/all-stats`)
      .all([Authenticate.verifyToken(), ReviewsController.checkAccessUserAdmin()])
      .get([wrapCatch(ReviewsController.allStats)]);

    this.app
      .route(`${this.path}/reviews/stats/:id`)
      .all([
        Authenticate.verifyToken(),
        middleware({ schema: validateUUID("id"), property: "params" }),
      ])
      .get([wrapCatch(ReviewsController.getAllReviewStats)]);
  }
}
