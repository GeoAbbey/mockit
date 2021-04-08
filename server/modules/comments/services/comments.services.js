import debug from "debug";
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

  async findMany(data) {
    debugLog(`retrieving comments with the following filter ${JSON.stringify(data)}`);
    return models.Comment.findAll(data);
  }

  async update(id, commentDTO, oldComment) {
    const { content, likedBy } = oldComment;

    const handleLikedBy = () => {
      if (commentDTO.reactorId) {
        const { reactorId } = commentDTO;
        likedBy[reactorId] = likedBy[reactorId] ? !likedBy[reactorId] : true;
        return likedBy;
      } else return likedBy;
    };
    return models.Comment.update(
      {
        content: commentDTO.content || content,
        likedBy: handleLikedBy(),
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
