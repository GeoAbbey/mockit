import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";

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

  async find(id, context) {
    debugLog(`looking for an Report with id ${id}`);
    if (context) {
      return models.Report.findByPk(id, {
        include: [
          {
            model: models.User,
            as: "ownerProfile",
            attributes: ["firstName", "lastName", "email", "profilePic"],
          },
          {
            model: models.Comment,
            as: "comments",
            where: { reportId: id },
            required: false,
          },
        ],
      });
    }
    return models.Report.findByPk(id);
  }

  async findMany(ownerId) {
    debugLog(`retrieving reports}`);
    return models.sequelize.query(
      `select *, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'repost') as reposts, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'like') as likes, (select count(id) from "Reactions" where "modelId" = "Reports".id and "modelType" = 'Report' and "reactionType" = 'like' and "ownerId" = '${ownerId}') as has_liked, (select count(id) from "Reactions" where "modelId" = "Reports".id and "reactionType" = 'repost' and "modelType" = 'Report' and "ownerId" = '${ownerId}') as has_reposted, (select count (id) from "Comments" where "reportId" = "Reports".id) as comments from "Reports"
    `,
      {
        type: QueryTypes.SELECT,
      }
    );
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
