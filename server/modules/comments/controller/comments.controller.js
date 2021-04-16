import debug from "debug";
import createError from "http-errors";

import CommentsService from "../services/comments.services";
const log = debug("app:comments-controller");

class CommentsController {
  static instance;
  static getInstance() {
    if (!CommentsController.instance) {
      CommentsController.instance = new CommentsController();
    }
    return CommentsController.instance;
  }

  async makeComment(req, res) {
    const {
      body,
      params: { id: reportId },
    } = req;
    const commenterId = req.decodedToken.id;
    log(`creating a new comment for user with id ${commenterId}`);
    const comment = await CommentsService.create({ reportId, ...body, commenterId });

    return res.status(201).send({
      success: true,
      message: "comment successfully created",
      comment,
    });
  }

  commentExits(context) {
    return async (req, res, next) => {
      const { id } = req.params;
      log(`verifying that a comment with id ${id} exits`);
      const comment = await CommentsService.find(id);
      if (!comment) return next(createError(404, "The comment can not be found"));
      req.oldComment = comment;
      next();
    };
  }

  async modifyComment(req, res, next) {
    const {
      body,
      oldComment,
      params: { id },
    } = req;

    const [, [updatedComment]] = await CommentsService.update(id, body, oldComment);
    return res.status(200).send({
      success: true,
      message: "comment successfully updated",
      comment: updatedComment,
    });
  }

  async deleteComment(req, res, next) {
    const { id } = req.params;
    log(`deleting a Comment with id ${id}`);
    const deletedComment = await CommentsService.remove(id);
    return res.status(200).send({
      success: true,
      message: "Comment successfully deleted",
      comment: deletedComment,
    });
  }

  getAComment(req, res, next) {
    const { oldComment } = req;
    return res.status(200).send({
      success: true,
      message: "comment successfully retrieved",
      comment: oldComment,
    });
  }

  async getAllComments(req, res, next) {
    log("getting all Comments");
    const { data } = req;
    const comments = await CommentsService.findMany(data);
    return res.status(200).send({
      success: true,
      message: "Comments successfully retrieved",
      comments,
    });
  }

  async amplifyAComment(req, res, next) {
    log("re-posting a comment");
    const {
      decodedToken: { id: amplifierId },
      params: { id },
      oldComment,
    } = req;

    const [, [updatedComment]] = await CommentsService.update(id, { amplifierId }, oldComment);
    return res.status(200).send({
      success: true,
      message: "comment successfully re-posted",
      comment: updatedComment,
    });
  }

  async reactToComment(req, res, next) {
    log("reacting to a comments");
    const {
      decodedToken: { id: reactorId },
      params: { id },
      oldComment,
    } = req;

    const [, [updatedComment]] = await CommentsService.update(id, { reactorId }, oldComment);
    return res.status(200).send({
      success: true,
      message: "Comment successfully updated",
      comment: updatedComment,
    });
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        oldComment: { commenterId },
      } = req;
      if (role === "admin" || role === "super-admin") next();
      if (role === "user" && id !== commenterId) {
        return next(createError(401, `You do not have access to ${context} this comment`));
      }
      next();
    };
  }

  queryContext(req, res, next) {
    const { role, id } = req.decodedToken;
    if (role === "admin" || role === "super-admin") {
      req.data = {};
    }
    if (role === "lawyer") {
      req.data = { where: { assignedLawyerId: id } };
    }
    if (role === "user") {
      req.data = { where: { ownerId: id } };
    }
    next();
  }
}

export default CommentsController.getInstance();
