import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { rawQueries } from "../../../utils/rawQueriers";
import { handleFalsy } from "../../../utils";
import { paginate } from "../../helpers";

const debugLog = debug("app:small-claims-service");

class SmallClaimsService {
  static instance;
  static getInstance() {
    if (!SmallClaimsService.instance) {
      SmallClaimsService.instance = new SmallClaimsService();
    }
    return SmallClaimsService.instance;
  }

  async create(SmallClaimDTO) {
    debugLog("creating a small claim");
    return models.SmallClaim.create(SmallClaimDTO);
  }

  async find(id, context, t = undefined) {
    debugLog(`looking for an small claim with id ${id}`);
    if (context) {
      console.log("I was called using context");
      return models.SmallClaim.findByPk(
        id,
        {
          include: [
            {
              model: models.User,
              as: "ownerProfile",
              attributes: [
                "firstName",
                "lastName",
                "email",
                "profilePic",
                "firebaseToken",
                "description",
                "phone",
              ],
              required: false,
              include: [
                {
                  model: models.PayIn,
                  as: "oneTimePayments",
                  where: { type: "singleSmallClaim", modelId: id },
                  attributes: ["amount"],
                  required: false,
                },
                {
                  model: models.Transaction,
                  as: "paymentFromWallet",
                  where: { type: "smallClaim", modelId: id },
                  attributes: ["amount"],
                  required: false,
                },
              ],
            },
            {
              model: models.User,
              as: "lawyerProfile",
              attributes: [
                "firstName",
                "lastName",
                "email",
                "profilePic",
                "firebaseToken",
                "description",
                "phone",
              ],
              required: false,
            },
            {
              model: models.InterestedLawyer,
              as: "myInterest",
              where: { lawyerId: context },
              attributes: ["serviceCharge", "lawyerId", "serviceChargeInNaira", "id"],
              required: false,
            },
            {
              model: models.Review,
              as: "reviews",
              where: { modelType: "SmallClaim", modelId: id },
              required: false,
            },
          ],
        },
        t
      );
    }
    return models.SmallClaim.findByPk(id);
  }

  async findMany(filter, pageDetails, canApply) {
    debugLog(`retrieving invitations with the following filter ${JSON.stringify(filter)}`);

    let temp = [
      {
        model: models.User,
        as: "lawyerProfile",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "profilePic",
          "firebaseToken",
          "phone",
          "sumOfReviews",
          "numOfReviews",
          "description",
        ],
        required: false,
      },
      {
        model: models.User,
        as: "ownerProfile",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "profilePic",
          "firebaseToken",
          "phone",
          "sumOfReviews",
          "numOfReviews",
          "description",
        ],
        required: false,
      },
    ];

    if (canApply) {
      temp.push(canApply(models.InterestedLawyer));
    }

    return models.SmallClaim.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
      ...paginate(pageDetails),
      include: temp,
    });
  }

  async update(id, smallClaimDTO, oldSmallClaim, t = undefined) {
    const {
      status,
      claim,
      venue,
      attachments,
      amount,
      assignedLawyerId,
      isReassessed,
      paid,
      isNotified,
    } = oldSmallClaim;
    const handleAttachments = () => {
      if (typeof smallClaimDTO.attachments === "number") {
        attachments.splice(smallClaimDTO.attachments, 1);
        return attachments;
      }
      if (smallClaimDTO.attachments) {
        return [...new Set([...attachments, ...smallClaimDTO.attachments])];
      }
      return attachments;
    };

    const handleAddresses = (recent, old) => ({
      country: recent.country || old.country,
      state: recent.state || old.state,
      residence: recent.residence || old.residence,
    });

    return models.SmallClaim.update(
      {
        status: smallClaimDTO.status || status,
        claim: smallClaimDTO.claim || claim,
        venue: smallClaimDTO.venue && handleAddresses(smallClaimDTO.venue, venue),
        amount: smallClaimDTO.amount || amount,
        isNotified: handleFalsy(smallClaimDTO.isNotified, isNotified),
        isReassessed: handleFalsy(smallClaimDTO.isReassessed, isReassessed),
        assignedLawyerId: smallClaimDTO.assignedLawyerId || assignedLawyerId,
        attachments: handleAttachments(),
        paid: handleFalsy(smallClaimDTO.paid, paid),
      },
      { where: { id }, returning: true, ...t }
    );
  }

  async remove(id) {
    debugLog(`deleting the small claim with id ${id}`);
    return models.SmallClaim.destroy({
      where: { id, status: "initiated" },
    });
  }

  async stats() {
    return models.sequelize.query(rawQueries.statistics("SmallClaims"), {
      type: QueryTypes.SELECT,
    });
  }
}

export default SmallClaimsService.getInstance();
