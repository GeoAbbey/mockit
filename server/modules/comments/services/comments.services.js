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

  async find(id) {
    debugLog(`looking for an comment with id ${id}`);
    return models.Comment.findByPk(id);
  }

  async findManyByReportId({ reportId, commenterId }) {
    debugLog(`retrieving comments}`);
    return models.sequelize.query(
      `select *, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and "reactionType" = 'repost') as reposts, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and  "reactionType" = 'like') as likes, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and "reactionType" = 'like' and "commenterId" = :commenterId) as has_liked, (select count(id) from "Reactions" where "modelId" = "Comments".id and "modelType" = 'Comment' and "reactionType" = 'repost' and "commenterId" = :commenterId) as has_reposted from "Comments" where "reportId" = :reportId`,
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
