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
                  where: { for: "singleSmallClaim", modelId: id },
                  attributes: ["amount"],
                  required: false,
                },
                {
                  model: models.Transaction,
                  as: "paymentFromWallet",
                  where: { modelType: "smallClaim", modelId: id },
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
              model: models.Review,
              as: "reviews",
              where: { modelType: "SmallClaim", modelId: id },
              required: false,
            },
            {
              model: models.InterestedLawyer,
              as: "interestedLawyers",
              where: { modelId: id },
              attributes: ["serviceCharge", "lawyerId", "serviceChargeInNaira", "id"],
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
                    "phone",
                    "id",
                    "firebaseToken",
                    "description",
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

  async findMany(filter, pageDetails) {
    debugLog(`retrieving small claims with the following filter ${JSON.stringify(filter)}`);

    const { limit, offset } = paginate(pageDetails);

    let params = filter ? `WHERE ${filter}` : "";

    const [data] = await models.sequelize.query(
      `SELECT count("SmallClaims"."id") AS "count" FROM "SmallClaims" AS "SmallClaims" LEFT OUTER JOIN "Users" AS "ownerProfile" ON "SmallClaims"."ownerId" = "ownerProfile"."id" AND ("ownerProfile"."deletedAt" IS NULL) LEFT OUTER JOIN "Users" AS "lawyerProfile" ON "SmallClaims"."assignedLawyerId" = "lawyerProfile"."id" AND ("lawyerProfile"."deletedAt" IS NULL) ${params}`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    const rows = await models.sequelize.query(
      `SELECT "SmallClaims".claim, "SmallClaims"."createdAt","SmallClaims"."paid","SmallClaims"."ticketId","SmallClaims"."status","SmallClaims"."venue","SmallClaims"."updatedAt", "SmallClaims".amount, "SmallClaims"."assignedLawyerId", "SmallClaims".attachments, "SmallClaims".id, "SmallClaims"."ownerId","ownerProfile"."lastName" AS "ownerProfile.lastName","ownerProfile"."firstName" AS "ownerProfile.firstName", "ownerProfile"."profilePic" AS "ownerProfile.profilePic", "ownerProfile".email AS "ownerProfile.email","ownerProfile".phone AS "ownerProfile.phone", "ownerProfile"."firebaseToken" AS "ownerProfile.firebaseToken","lawyerProfile"."lastName" AS "lawyerProfile.lastName", "lawyerProfile"."firstName" AS "lawyerProfile.firstName", "lawyerProfile"."profilePic" AS "lawyerProfile.profilePic", "lawyerProfile".email AS "lawyerProfile.email","lawyerProfile".phone AS "lawyerProfile.phone", "lawyerProfile"."firebaseToken" AS "lawyerProfile.firebaseToken", (SELECT AVG("Reviews".rating) FROM "Reviews" WHERE "Reviews"."reviewerId" = "SmallClaims"."assignedLawyerId") AS "lawyerProfile.averageRating", (SELECT COUNT(id) FROM "Reviews" WHERE "Reviews"."reviewerId" = "SmallClaims"."assignedLawyerId") AS "lawyerProfile.noOfReviews" FROM "SmallClaims" LEFT OUTER JOIN "Users" AS "lawyerProfile" ON "SmallClaims"."assignedLawyerId" = "lawyerProfile".id LEFT OUTER JOIN "Users" AS "ownerProfile" ON "SmallClaims"."ownerId" = "ownerProfile".id ${params} ORDER BY "SmallClaims"."createdAt" DESC LIMIT ${limit} OFFSET ${offset};`,
      {
        nest: true,
        type: QueryTypes.SELECT,
      }
    );

    return {
      count: parseInt(data.count),
      rows,
    };
  }

  async update(id, smallClaimDTO, oldSmallClaim, t = undefined) {
    const {
      status,
      claim,
      venue,
      attachments,
      amount,
      assignedLawyerId,
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
