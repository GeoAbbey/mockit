import debug from "debug";
import models from "../../../models";
import { handleFalsy } from "../../../utils";
import smallClaimsService from "../../small-claims/services/small-claims.service";
import { paginate } from "../../helpers";

const debugLog = debug("app:MileStones-service");

class MileStonesService {
  static instance;
  static getInstance() {
    if (!MileStonesService.instance) {
      MileStonesService.instance = new MileStonesService();
    }
    return MileStonesService.instance;
  }

  async find(id, t = undefined) {
    debugLog(`looking for an mile stone with id ${id}`);
    return models.MileStone.findByPk(id, t);
  }

  async findOne({ claimId }) {
    debugLog(`looking for an mile stone with claimId ${claimId}`);
    return models.MileStone.findOne({ where: { claimId } });
  }

  async bulkCreate(MileStoneDTO) {
    debugLog("creating a series of mile stones");
    const lawyerId = MileStoneDTO[0].lawyerId;
    const claim = await smallClaimsService.find(MileStoneDTO[0].claimId);

    if (lawyerId !== claim.assignedLawyerId)
      return {
        success: false,
        message: "You do not have permission to access this resource",
      };

    if (claim.status !== "consultation_completed")
      return {
        success: false,
        message: "Kindly complete consultation before proceeding to create a milestone",
      };

    const mileStones = await models.MileStone.bulkCreate(MileStoneDTO);
    return {
      success: true,
      message: "mile stones successfully created",
      mileStones,
    };
  }

  async findMany(filter, pageDetails) {
    debugLog(`retrieving milestones with the following filter ${JSON.stringify(filter)}`);
    return models.MileStone.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
      ...paginate(pageDetails),
    });
  }

  async update(id, MileStoneDTO, oldMileStone, t = undefined) {
    const { status, paid, title, content } = oldMileStone;

    return models.MileStone.update(
      {
        status: MileStoneDTO.status || status,
        title: MileStoneDTO.title || title,
        content: MileStoneDTO.content || content,
        paid: handleFalsy(MileStoneDTO.paid, paid),
      },
      { where: { id }, returning: true, ...t }
    );
  }
}

export default MileStonesService.getInstance();
