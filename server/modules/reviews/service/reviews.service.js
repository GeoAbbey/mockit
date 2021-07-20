import debug from "debug";
import { Op, QueryTypes } from "sequelize";
import models from "../../../models";
import { paginate } from "../../helpers";

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
      const forId =
        validModelIdWithOwnerOrLawyer.ownerId === reviewerId
          ? validModelIdWithOwnerOrLawyer.assignedLawyerId
          : validModelIdWithOwnerOrLawyer.ownerId;

      return models.Review.create({ ...ReviewDTO, forId });
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

    return models.Review.findAll({
      where: { modelId, modelType },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.User,
          as: "reviewerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "phone", "role"],
          required: false,
        },
      ],
    });
  }

  async findMany(filter, pageDetails) {
    debugLog(`finding all review with the query context ${JSON.stringify(filter)}`);

    return models.Review.findAndCountAll({
      where: { ...filter },
      ...paginate(pageDetails),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.User,
          as: "reviewerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "phone", "role"],
          required: false,
        },
        {
          model: models.User,
          as: "receiverProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "phone", "role"],
          required: false,
        },
      ],
    });
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
  async getStats(id) {
    debugLog(`retrieving statistics for a lawyer with ${id}`);
    return models.sequelize.query(
      `SELECT "Users".email, "Users"."firebaseToken", "Users"."phone", "Users"."lawyer", "Users"."lastName", "Users"."firstName", "Users"."profilePic",(select count(id) from "Reviews" where "reviewerId" = :id) as total_rating,(select avg(rating) from "Reviews" where "reviewerId" = :id) as avg_rating,(select count(id) from "Reviews" where "reviewerId" = :id and rating > 2) as positive_rating FROM "Users" WHERE "Users".id = :id;`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );
  }

  async getReviewStats() {
    debugLog(`getting statistics for all reviews on the platform`);
    return models.sequelize.query(
      `select count(id) as total_rating, (select count(id) as pst_rating from "Reviews" where rating > 2) from "Reviews";`,
      {
        type: QueryTypes.SELECT,
      }
    );
  }
}

export default ReviewsService.getInstance();
