import debug from "debug";
import createError from "http-errors";
import { EVENT_IDENTIFIERS } from "../../../constants";

import ReviewsService from "../service/reviews.service";
const log = debug("app:reviews-controller");

class ReviewsController {
  static instance;
  static getInstance() {
    if (!ReviewsController.instance) {
      ReviewsController.instance = new ReviewsController();
    }

    return ReviewsController.instance;
  }

  async makeReview(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body,
      params: { id, modelType },
      decodedToken: { id: reviewerId },
    } = req;
    log(`creating a new invitation for user with id ${reviewerId}`);
    const review = await ReviewsService.create({ ...body, reviewerId, modelId: id, modelType });
    if (!review) return next(createError(403, "You are not authorized to perform this operation"));

    eventEmitter.emit(EVENT_IDENTIFIERS.REVIEW.CREATED, review);
    return res.status(201).send({
      success: true,
      message: "review successfully created",
      review,
    });
  }

  async deleteReview(req, res) {
    const {
      params: { id },
    } = req;
    log(`deleting a review for id ${id}`);
    const deletedReview = await ReviewsService.remove(id);

    return res.status(200).send({
      success: true,
      message: "review successfully deleted",
      review: deletedReview,
    });
  }

  async editReview(req, res) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body,
      params: { id },
      oldReview,
    } = req;

    const [, [updatedReview]] = await ReviewsService.update(id, body, oldReview);

    eventEmitter.emit(EVENT_IDENTIFIERS.REVIEW.EDITED, updatedReview);

    return res.status(200).send({
      success: true,
      message: "review successfully updated",
      review: updatedReview,
    });
  }

  reviewExits(context) {
    return async (req, res, next) => {
      const {
        params: { id: modelId, modelType },
        decodedToken: { id: reviewerId },
      } = req;
      if (context !== "create") {
        const review = await ReviewsService.find(req.params.id);
        if (!review) return next(createError(404, "The review can not be found"));
        req.oldReview = review;
        next();
      } else {
        const review = await ReviewsService.findOne({ modelId, modelType, reviewerId });
        if (review)
          return next(
            createError(403, `You can only have one review per ${modelType} with ${modelId}`)
          );
        return next();
      }
    };
  }

  async getSpecificReview(req, res) {
    const { oldReview: review } = req;
    return res.status(200).send({
      success: true,
      message: "review successfully retrieved",
      review,
    });
  }

  async getAssociatedReviews(req, res, next) {
    const {
      params: { modelType, id: modelId },
    } = req;
    const reviews = await ReviewsService.findAssociated({ modelType, modelId });
    return res.status(200).send({
      success: true,
      message: "review successfully retrieved",
      reviews,
    });
  }

  async getAllReviews(req, res, next) {
    let context = {};
    if (req.query.modelType) {
      const { modelType } = req.query;
      context = { modelType };
      req.data = {
        ...req.data.where,
        ...context,
      };
    }
    const reviews = await ReviewsService.findMany(req.data);
    return res.status(200).send({
      success: true,
      message: "review successfully retrieved",
      reviews,
    });
  }

  async allStats(req, res, next){
   const result =  await ReviewsService.getReviewStats()

   return res.status(200).send({
    success: true,
    message: "stats successfully retrieved",
    result,
  });
  }

  async getAllReviewStats(req, res, next) {
    const {
      params: { id },
    } = req;

    const stats = await ReviewsService.getStats(id);

    return res.status(200).send({
      success: true,
      message: "review successfully updated",
      stats,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldReview: { reviewerId },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role === "user" && id !== reviewerId) {
        return next(createError(401, `You do not have access to ${context} this review`));
      }
      return next();
    };
  }

  checkAccessUserAdmin(){
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(400, `You do not have access use this route`));
    }
  }

  queryContext(req, res, next) {
    const { role, id } = req.decodedToken;
    if (role === "admin" || role === "super-admin") {
      req.data = { where: {} };
    }
    if (role === "lawyer" || role === "user") {
      req.data = { where: { reviewerId: id } };
    }
    return next();
  }
}

export default ReviewsController.getInstance();
