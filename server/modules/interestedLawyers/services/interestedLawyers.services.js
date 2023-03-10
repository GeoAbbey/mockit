import debug from "debug";
import models from "../../../models";
import { paginate } from "../../helpers";

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
    const { claimId } = lawyerDTO;
    const verifyRecordExist = await models.SmallClaim.findOne({
      where: {
        id: claimId,
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

  async findMany(pageDetails, id) {
    debugLog(`retrieving interested lawyer for the claim with id ${id}`);
    return models.InterestedLawyer.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { claimId: id },
      ...paginate(pageDetails),
      include: [
        {
          model: models.User,
          as: "profile",
          attributes: [
            "firstName",
            "lastName",
            "email",
            "profilePic",
            "firebaseToken",
            "phone",
            "description",
          ],
          required: false,
        },
      ],
    });
  }

  async find(id) {
    debugLog(`finding a interest with  the following ${id}`);
    return models.InterestedLawyer.findByPk(id);
  }

  async update(id, interestDTO, oldInterest) {
    debugLog(`updating an interest with the following ${id}`);
    const { serviceCharge } = oldInterest;

    return models.InterestedLawyer.update(
      {
        serviceCharge: interestDTO.serviceCharge || serviceCharge,
      },
      { where: { id }, returning: true }
    );
  }
}

export default InterestedLawyersService.getInstance();
