import debug from "debug";
import createError from "http-errors";

import ReactionsService from "../services/reactions.services";
const log = debug("app:Reactions-controller");

class ReactionsController {
  static instance;
  static getInstance() {
    if (!ReactionsController.instance) {
      ReactionsController.instance = new ReactionsController();
    }
    return ReactionsController.instance;
  }

  async makeReaction(req, res, next) {
    const {
      decodedToken: { id: ownerId },
      params: { id: modelId, modelType, reactionType },
    } = req;
    log(`creating a new reaction for user with id ${ownerId}`);
    const reaction = await ReactionsService.create({
      ownerId,
      modelId,
      modelType,
      reactionType,
      value: true,
    });

    if (!reaction)
      return next(
        createError(
          404,
          `can not create a reaction because model ${modelType} with id ${modelId} can not be found.`
        )
      );
    return res.status(201).send({
      success: true,
      message: "reaction successfully created",
      reaction,
    });
  }
}

export default ReactionsController.getInstance();
