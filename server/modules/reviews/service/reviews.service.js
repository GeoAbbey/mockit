import debug from "debug";
import { Op } from "sequelize";
import models from "../../../models";

const debugLog = debug("app:reviews-service");

class ReviewsService {
  static instance;
  static getInstance() {
    if (!ReviewsService.instance) {
      ReviewsService.instance = new ReviewsService();
    }
    return ReviewsService.instance;
  }

  async create(ReviewDTO) {
    debugLog("creating a review");
    const { modelType, reviewerId, modelId } = ReviewDTO;
    const validModelIdWithOwnerOrLawyer = await models[modelType].findOne({
      where: {
        id: modelId,
        status: "completed",
        [Op.or]: [
          {
            ownerId: reviewerId,
          },
          { assignedLawyerId: reviewerId },
        ],
      },
    });
    if (validModelIdWithOwnerOrLawyer) {
      return models.Review.create(ReviewDTO);
    } else return null;
  }

  async remove(id) {
    debugLog(`deleting a review with ${id}`);
    return models.Review.destroy({ where: { id } });
  }

  async find(id) {
    debugLog(`finding a review with  ${id}`);
    return models.Review.findByPk(id);
  }

  async findOne(searchContext) {
    debugLog(`finding a review with ${searchContext}`);
    return models.Review.findOne({ where: searchContext });
  }

  async findAssociated(context) {
    debugLog(`getting a reviews with the following filters ${JSON.stringify(context)}`);
    const { modelId, modelType } = context;

    return models.Review.findAll({ where: { modelId, modelType } });
  }

  async findMany(context) {
    debugLog(`finding all review with the query context ${JSON.stringify(context)}`);
    return models.Review.findAll(context);
  }

  async update(id, ReviewDTO, oldReview) {
    const { rating, feedback } = oldReview;
    return models.Review.update(
      {
        rating: ReviewDTO.rating || rating,
        feedback: ReviewDTO.feedback || feedback,
      },
      { where: { id }, returning: true }
    );
  }
}

export default ReviewsService.getInstance();
