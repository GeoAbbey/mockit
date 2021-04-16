import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:interested-lawyers-service");

class InterestedLawyersService {
  static instance;
  static getInstance() {
    if (!InterestedLawyersService.instance) {
      InterestedLawyersService.instance = new InterestedLawyersService();
    }
    return InterestedLawyersService.instance;
  }

  async create(lawyerDTO) {
    debugLog(`trying to create interest for lawyer with ${JSON.stringify(lawyerDTO)}`);
    const { modelType, modelId } = lawyerDTO;
    const verifyRecordExist = await models[modelType].findOne({
      where: {
        id: modelId,
      },
    });
    if (verifyRecordExist) {
      return models.InterestedLawyer.create(lawyerDTO);
    } else return null;
  }

  async findOne(searchContext) {
    debugLog(`finding an already existing interest with filter ${searchContext}`);
    return models.InterestedLawyer.findOne({ where: searchContext });
  }

  async find(id) {
    debugLog(`finding a interest with  the following ${id}`);
    return models.InterestedLawyer.findByPk(id);
  }

  async update(id, interestDTO, oldInterest) {
    debugLog(`updating an interest with  the following ${id}`);
    const { baseCharge, serviceCharge } = oldInterest;

    return models.InterestedLawyer.update(
      {
        serviceCharge: interestDTO.serviceCharge || serviceCharge,
        baseCharge: interestDTO.baseCharge || baseCharge,
      },
      { where: { id }, returning: true }
    );
  }
}

export default InterestedLawyersService.getInstance();
