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
            model: models.Comment,
            as: "reportComments",
            where: { reportId: id },
            required: false,
          },
        ],
      });
    }
    return models.Report.findByPk(id);
  }

  async findMany(data) {
    debugLog(`retrieving reports with the following filter ${JSON.stringify(data)}`);
    return models.Report.findAll(data);
  }

  async update(id, ReportDTO, oldReport) {
    const { content, attachments, likedBy } = oldReport;
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

    const handleLikedBy = () => {
      if (ReportDTO.reactorId) {
        const { reactorId } = ReportDTO;
        likedBy[reactorId] = likedBy[reactorId] ? !likedBy[reactorId] : true;
        return likedBy;
      } else return likedBy;
    };
    return models.Report.update(
      {
        content: ReportDTO.content || content,
        attachments: handleAttachments(),
        likedBy: handleLikedBy(),
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
