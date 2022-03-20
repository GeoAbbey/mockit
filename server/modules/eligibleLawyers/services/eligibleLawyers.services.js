import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:eligibleLawyers-details-service");
class EligibleLawyersService {
  static instance;
  static getInstance() {
    if (!EligibleLawyersService.instance) {
      EligibleLawyersService.instance = new EligibleLawyersService();
    }
    return EligibleLawyersService.instance;
  }

  async find(responseId, lawyerId) {
    debugLog(`finding an eligible lawyer with responseId ${responseId} and lawyerId ${lawyerId}`);
    const search = { responseId };
    if (lawyerId) search = { ...search, lawyerId };

    return models.EligibleLawyer.findAll({ where: search });
  }

  async findMany(data) {
    debugLog(`finding all eligible lawyers with the filter ${JSON.stringify(data)}`);
    return models.EligibleLawyer.findAll(data);
  }

  async getLawyersForResponse(responseId) {
    debugLog(`finding all eligible lawyers with the filter ${JSON.stringify(responseId)}`);
    return models.EligibleLawyer.findAll({
      where: { responseId },
      include: [
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: ["id"],
          include: {
            model: models.LocationDetail,
          },
        },
      ],
    });
  }

  async bulkCreate(EligibleLawyerDTO) {
    debugLog("creating a list of eligible lawyers for a particular response");
    return models.EligibleLawyer.bulkCreate(EligibleLawyerDTO);
  }

  async create(EligibleLawyerDTO) {
    debugLog("creating an eligible lawyer for a response");
    return models.EligibleLawyer.create(EligibleLawyerDTO);
  }

  async remove(responseId, filter = undefined) {
    debugLog(`deleting the lawyer with id ${responseId} and filter ${JSON.stringify(filter)} `);
    return models.EligibleLawyer.destroy({
      where: { responseId, ...filter },
    });
  }
}

export default EligibleLawyersService.getInstance();
