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

  async find(id) {
    debugLog(`looking for an SmallClaim with id ${id}`);
    return models.SmallClaim.findByPk(id);
  }

  async findMany(data) {
    debugLog(`retrieving SmallClaims with the following filter ${JSON.stringify(data)}`);
    return models.SmallClaim.findAll(data);
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
        attachments: handleAttachments(),
        assignedLawyerId: smallClaimDTO.assignedLawyerId || assignedLawyerId,
      },
      filter ? filter : { where: { id, assignedLawyerId: null }, returning: true }
    );
  }

  async remove(id) {
    debugLog(`deleting the SmallClaim with id ${id}`);
    return models.SmallClaim.destroy({
      where: { id, assignedLawyerId: null },
    });
  }
}

export default SmallClaimsService.getInstance();
