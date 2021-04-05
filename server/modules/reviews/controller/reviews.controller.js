import debug from "debug";
import createError from "http-errors";

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
    const {
      body,
      params: { id, modelName },
      decodedToken: { id: reviewerId },
    } = req;
    log(`creating a new invitation for user with id ${reviewerId}`);
    const review = await ReviewsService.create({ ...body, reviewerId, modelId: id, modelName });
    if (!review) return next(createError(403, "You are not authorized to perform this operation"));

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
    const {
      body,
      params: { id },
      oldReview,
    } = req;

    const [, [updatedReview]] = await ReviewsService.update(id, body, oldReview);
    return res.status(200).send({
      success: true,
      message: "review successfully updated",
      review: updatedReview,
    });
  }

  reviewExits(context) {
    return async (req, res, next) => {
      const {
        params: { id: modelId, modelName },
        decodedToken: { id: reviewerId },
      } = req;
      if (context !== "create") {
        const review = await ReviewsService.find(req.params.id);
        if (!review) return next(createError(404, "The review can not be found"));
        req.oldReview = review;
        next();
      } else {
        const review = await ReviewsService.findOne({ modelId, modelName, reviewerId });
        if (review)
          return next(
            createError(403, `You can only have one review per ${modelName} with ${modelId}`)
          );
        next();
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
      params: { modelName, id: modelId },
    } = req;
    const reviews = await ReviewsService.findAssociated({ modelName, modelId });
    return res.status(200).send({
      success: true,
      message: "review successfully retrieved",
      reviews,
    });
  }

  async getAllReviews(req, res, next) {
    let context = {};
    if (req.query.modelName) {
      const { modelName } = req.query;
      context = { where: { modelName } };
    }
    const reviews = await ReviewsService.findMany(context);
    return res.status(200).send({
      success: true,
      message: "review successfully retrieved",
      reviews,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldReview: { reviewerId },
      } = req;
      if (role === "admin" || role === "super-admin") next();
      if (role === "user" && id !== reviewerId) {
        return next(createError(401, `You do not have access to ${context} this review`));
      }
      next();
    };
  }
}

export default ReviewsController.getInstance();
