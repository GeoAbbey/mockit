import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { paginate } from "../../helpers";
const debugLog = debug("app:reports-service");

class ReportsService {
  static instance;
  static getInstance() {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  async create(ReportDTO) {
    debugLog("creating a report");
    return models.Report.create(ReportDTO);
  }

  async find(id, context, reporterId) {
    debugLog(`looking for an report with filter ${JSON.stringify(id)}`);
    if (context) {
      return models.sequelize.query(
        `select "Reports".id, "Reports".attachments,"Reports".content, "Reports"."ticketId", "Reports".location, "Reports"."createdAt", "Reports"."updatedAt", "Reports".meta, "Reports"."reporterId", "Users"."profilePic", "Users".email, "Users"."firebaseToken", "Users"."firstName", "Users"."lastName", (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'repost') as reposts, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'like') as likes, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'like' and "ownerId" =:reporterId) as has_liked, (select count(id) from "Reactions" where "modelId" = "Reports".id and "reactionType" = 'repost' and "modelType" = 'Report' and "ownerId" = :reporterId) as has_reposted, (select count (id) from "Comments" where "reportId" = "Reports".id) as comments from "Reports" INNER JOIN "Users" ON "Reports"."reporterId" = "Users"."id" WHERE "Reports"."id" = :id;`,
        {
          type: QueryTypes.SELECT,
          replacements: { id, reporterId },
        }
      );
    }
    return models.Report.findByPk(id);
  }

  async findManyAdmin(filter, pageDetails) {
    debugLog(`retrieving reports for by an admin user`);
    return models.Report.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: {
        ...filter,
      },
      ...paginate(pageDetails),
      include: [
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
      ],
    });
  }

  async findMany(replacements, pageDetails) {
    debugLog(`retrieving reports`);
    const { limit, offset } = paginate(pageDetails);

    const [data] = await models.sequelize.query(`SELECT count("Reports"."id") from "Reports"`, {
      nest: true,
      type: QueryTypes.SELECT,
    });

    const rows = await models.sequelize.query(
      `select "Reports".id, "Reports".attachments,"Reports".content, "Reports"."ticketId", "Reports".location, "Reports"."createdAt", "Reports"."updatedAt", "Reports".meta, "Reports"."reporterId", "Users"."profilePic", "Users".email, "Users"."firebaseToken", "Users"."firstName", "Users"."lastName", (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'repost') as reposts, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'like') as likes, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'like' and "ownerId" =:reporterId) as has_liked, (select count(id) from "Reactions" where "modelId" = "Reports".id and "reactionType" = 'repost' and "modelType" = 'Report' and "ownerId" = :reporterId) as has_reposted, (select count (id) from "Comments" where "reportId" = "Reports".id) as comments from "Reports" INNER JOIN "Users" ON "Reports"."reporterId" = "Users"."id" ORDER BY "Reports"."createdAt" DESC LIMIT ${limit} OFFSET ${offset};`,
      {
        type: QueryTypes.SELECT,
        replacements,
      }
    );

    return { count: parseInt(data.count), rows };
  }

  async update(id, ReportDTO, oldReport) {
    const { content, attachments, location } = oldReport;
    const handleAttachments = () => {
      if (typeof ReportDTO.attachments === "number") {
        attachments.splice(ReportDTO.attachments, 1);
        return attachments;
      }
      if (ReportDTO.attachments) {
        return [...new Set([...attachments, ...ReportDTO.attachments])];
      }
      return attachments;
    };

    return models.Report.update(
      {
        content: ReportDTO.content || content,
        location: ReportDTO.location || location,
        attachments: handleAttachments(),
      },
      { where: { id }, returning: true }
    );
  }

  async remove(id) {
    debugLog(`deleting the Report with id ${id}`);
    return models.Report.destroy({
      where: { id },
    });
  }
}

export default ReportsService.getInstance();
