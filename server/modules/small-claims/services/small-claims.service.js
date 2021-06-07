import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { rawQueries } from "../../../utils/rawQueriers";
import { handleFalsy } from "../../../utils";

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
              model: models.Review,
              as: "reviews",
              where: { modelType: "SmallClaim", modelId: id },
              required: false,
            },
            {
              model: models.InterestedLawyer,
              as: "interestedLawyers",
              where: { modelType: "SmallClaim", modelId: id },
              attributes: ["baseCharge", "serviceCharge", "lawyerId"],
              required: false,
              include: [
                {
                  model: models.User,
                  as: "profile",
                  attributes: [
                    "firstName",
                    "lastName",
                    "email",
                    "profilePic",
                    "id",
                    "firebaseToken",
                  ],
                },
              ],
            },
          ],
        },
        t
      );
    }
    return models.SmallClaim.findByPk(id);
  }

  async findMany({ ownerId = "", assignedLawyerId = "" }) {
    debugLog(
      `retrieving SmallClaims with the following filter ${JSON.stringify({
        ownerId,
        assignedLawyerId,
      })}`
    );
    let filter = "";
    if (ownerId) {
      filter = `WHERE "SmallClaims"."ownerId" = :ownerId`;
    }

    if (assignedLawyerId) {
      filter = `WHERE "SmallClaims"."assignedLawyerId" = :assignedLawyerId`;
    }

    if (assignedLawyerId === null) {
      filter = `WHERE "SmallClaims"."assignedLawyerId" IS NULL`;
    }
    return models.sequelize.query(
      `SELECT "SmallClaims".claim, "SmallClaims"."createdAt", "SmallClaims"."status","SmallClaims"."venue","SmallClaims"."updatedAt", "SmallClaims".amount, "SmallClaims"."assignedLawyerId", "SmallClaims".attachments, "SmallClaims".id, "SmallClaims"."ownerId", "lawyerProfile"."lastName" AS "lawyerProfile.lastName", "lawyerProfile"."firstName" AS "lawyerProfile.firstName", "lawyerProfile"."profilePic" AS "lawyerProfile.profilePic", "lawyerProfile".email AS "lawyerProfile.email","lawyerProfile".phone AS "lawyerProfile.phone", "lawyerProfile"."firebaseToken" AS "lawyerProfile.firebaseToken", (SELECT AVG("Reviews".rating) FROM "Reviews" WHERE "Reviews"."reviewerId" = "SmallClaims"."assignedLawyerId") AS "lawyerProfile.averageRating", (SELECT COUNT(id) FROM "Reviews" WHERE "Reviews"."reviewerId" = "SmallClaims"."assignedLawyerId") AS "lawyerProfile.noOfReviews" FROM "SmallClaims" LEFT OUTER JOIN "Users" AS "lawyerProfile" ON "SmallClaims"."assignedLawyerId" = "lawyerProfile".id ${filter} ORDER BY "SmallClaims"."createdAt" DESC;`,
      {
        nest: true,
        type: QueryTypes.SELECT,
        replacements: { ownerId, assignedLawyerId },
      }
    );
  }

  async update(id, smallClaimDTO, oldSmallClaim, t = undefined) {
    const { status, claim, venue, attachments, amount, assignedLawyerId, paid } = oldSmallClaim;
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
