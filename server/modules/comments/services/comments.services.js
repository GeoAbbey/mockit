import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";

const debugLog = debug("app:Comments-service");

class CommentsService {
  static instance;
  static getInstance() {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService();
    }
    return CommentsService.instance;
  }

  async create(commentDTO) {
    debugLog("creating a comment");
    return models.Comment.create(commentDTO);
  }

  async find(id, context) {
    debugLog(`looking for an comment with id ${id}`);
    if (context)
      return models.Comment.findByPk(id, {
        include: [
          {
            model: models.User,
            as: "ownerProfile",
            attributes: ["firstName", "lastName", "email", "profilePic", "id", "address"],
          },
        ],
      });
    return models.Comment.findByPk(id);
  }

  async findManyByReportId({ reportId, commenterId }) {
    debugLog(`retrieving comments}`);
    return models.sequelize.query(
      `select "Comments"."commenterId","Comments".id, "Comments".content, "Comments"."reportId", "Comments"."createdAt","Comments"."updatedAt", "Users"."profilePic", "Users".email, "Users"."firstName", "Users"."firebaseToken", "Users"."lastName",(select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and "reactionType" = 'repost') as reposts, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and  "reactionType" = 'like') as likes, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and "reactionType" = 'like' and "commenterId" = :commenterId) as has_liked, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and "reactionType" = 'repost' and "commenterId" =:commenterId) as has_reposted from "Comments" INNER JOIN "Users" ON "Comments"."commenterId" = "Users"."id" where "reportId" = :reportId ORDER BY "Comments"."createdAt" DESC;`,
      {
        replacements: { commenterId, reportId },
        type: QueryTypes.SELECT,
      }
    );
  }

  async update(id, commentDTO, oldComment) {
    const { content } = oldComment;
    return models.Comment.update(
      {
        content: commentDTO.content || content,
      },
      { where: { id }, returning: true }
    );
  }

  async remove(id) {
    debugLog(`deleting the Comment with id ${id}`);
    return models.Comment.destroy({
      where: { id },
    });
  }
}

export default CommentsService.getInstance();
