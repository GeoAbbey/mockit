import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:reactions-service");

class ReactionsService {
  static instance;
  static getInstance() {
    if (!ReactionsService.instance) {
      ReactionsService.instance = new ReactionsService();
    }
    return ReactionsService.instance;
  }

  async create(ReactionDTO) {
    debugLog("creating a reaction");
    const { modelType, modelId, ownerId, reactionType } = ReactionDTO;
    const id = modelId;
    const modelInstanceExist = await models[modelType].findByPk(id);
    const isOldReaction = await models.Reaction.findOne({
      where: {
        ownerId,
        reactionType,
        modelType,
        modelId,
      },
    });
    if (modelInstanceExist) {
      if (isOldReaction) return this.update(isOldReaction);
      return models.Reaction.create(ReactionDTO);
    }

    return null;
  }

  async update(oldReaction) {
    const { value, id } = oldReaction;
    const [, [updatedReaction]] = await models.Reaction.update(
      {
        value: !value,
      },
      { where: { id }, returning: true }
    );
    return updatedReaction;
  }
}

export default ReactionsService.getInstance();
