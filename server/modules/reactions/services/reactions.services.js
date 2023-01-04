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
    const mapper = {
      like: "numOfLikes",
      repost: "numOfRePosts",
    };

    try {
      return models.sequelize.transaction(async (t) => {
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
          if (isOldReaction) {
            isOldReaction.value
              ? await modelInstanceExist.decrement(mapper[reactionType], { transaction: t })
              : await modelInstanceExist.increment(mapper[reactionType], { transaction: t });
            return this.update(isOldReaction, { transaction: t });
          }

          await modelInstanceExist.increment(mapper[reactionType], { transaction: t });
          return models.Reaction.create(ReactionDTO, { transaction: t });
        }
        return null;
      });
    } catch (error) {}
  }

  async update(oldReaction, t = undefined) {
    const { value, id } = oldReaction;
    const [, [updatedReaction]] = await models.Reaction.update(
      {
        value: !value,
      },
      { where: { id }, returning: true, ...t }
    );
    return updatedReaction;
  }
}

export default ReactionsService.getInstance();
