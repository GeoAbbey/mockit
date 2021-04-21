import debug from "debug";

import models from "../../../models";

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

  async find(id, context) {
    debugLog(`looking for an SmallClaim with id ${id}`);
    if (context) {
      return models.SmallClaim.findByPk(id, {
        include: [
          {
            model: models.Review,
            as: "reviews",
            where: { modelType: "SmallClaim", modelId: id },
            required: false,
          },
          {
            model: models.InterestedLawyer,
            as: "interestedLawyers",
            where: { modelType: "SmallClaim", modelId: id },
            attributes: ["baseCharge", "serviceCharge"],
            required: false,
            include: [
              {
                model: models.User,
                as: "profile",
                attributes: ["firstName", "lastName", "email", "profilePic"],
              },
            ],
          },
        ],
      });
    }
    return models.SmallClaim.findByPk(id);
  }

  async findMany(data) {
    debugLog(`retrieving SmallClaims with the following filter ${JSON.stringify(data)}`);
    return models.SmallClaim.findAll({
      include: [
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic"],
          data,
        },
      ],
    });
  }

  async update(id, smallClaimDTO, oldSmallClaim, filter) {
    const { status, claim, venue, attachments, amount, assignedLawyerId } = oldSmallClaim;
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

    return models.SmallClaim.update(
      {
        status: smallClaimDTO.status || status,
        claim: smallClaimDTO.claim || claim,
        venue: smallClaimDTO.venue || venue,
        amount: smallClaimDTO.amount || amount,
        assignedLawyerId: smallClaimDTO.assignedLawyerId || assignedLawyerId,
        attachments: handleAttachments(),
      },
      { where: { id }, returning: true }
    );
  }

  async remove(id) {
    debugLog(`deleting the SmallClaim with id ${id}`);
    return models.SmallClaim.destroy({
      where: { id, status: "initiated" },
    });
  }
}

export default SmallClaimsService.getInstance();
