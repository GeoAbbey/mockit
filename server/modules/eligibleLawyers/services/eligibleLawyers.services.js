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

  async find(id) {
    debugLog(`finding an eligible lawyer with id ${id}`);
    return models.EligibleLawyer.findByPk(id);
  }

  async findMany(data) {
    debugLog(`finding all eligible lawyers with the filter ${JSON.stringify(data)}`);
    return models.EligibleLawyer.findAll(data);
  }

  async bulkCreate(EligibleLawyerDTO) {
    debugLog("creating a list of eligible lawyers for a particular response");
    return models.EligibleLawyer.bulkCreate(EligibleLawyerDTO);
  }

  async create(EligibleLawyerDTO) {
    debugLog("creating an eligible lawyer for a response");
    return models.EligibleLawyer.create(EligibleLawyerDTO);
  }

  async remove(id) {
    debugLog(`deleting the invitation with id ${id}`);
    return models.EligibleLawyer.destroy({
      where: { id },
    });
  }
}

export default EligibleLawyersService.getInstance();
