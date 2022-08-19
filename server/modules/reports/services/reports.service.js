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

  async findMany(ownerId, pageDetails) {
    debugLog(`retrieving reports`);
    return models.Report.findAndCountAll({
      order: [["createdAt", "DESC"]],
      ...paginate(pageDetails),
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
            "phone",
            "description",
          ],
          required: false,
        },
        {
          model: models.Reaction,
          as: "hasLiked",
          where: { reactionType: "like", ownerId },
          attributes: ["value"],
          required: false,
        },
        {
          model: models.Reaction,
          as: "hasRePosted",
          attributes: ["value"],
          where: { reactionType: "repost", ownerId },
          required: false,
        },
      ],
    });
  }
  hasLiked;
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
