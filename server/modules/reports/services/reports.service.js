import debug from "debug";
import sequelize from "sequelize";
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

  async findMany() {
    debugLog(`retrieving reports}`);
    return models.Report.findAll({
      attributes: {
        include: [[sequelize.fn("COUNT", sequelize.col("comments.id")), "numOfComments"]],
      },
      include: [
        { model: models.Comment, as: "comments", attributes: [] },
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic"],
        },
      ],

      group: ["Report.id", "ownerProfile.id"],
    });
  }

  async update(id, ReportDTO, oldReport) {
    const { content, attachments, likedBy, amplifiedBy, location } = oldReport;
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

    const handleAmplifiedBy = () => {
      if (ReportDTO.amplifierId) {
        const { amplifierId } = ReportDTO;
        amplifiedBy[amplifierId] = amplifiedBy[amplifierId] ? !amplifiedBy[amplifierId] : true;
        return amplifiedBy;
      } else return amplifiedBy;
    };
    return models.Report.update(
      {
        content: ReportDTO.content || content,
        location: ReportDTO.location || location,
        attachments: handleAttachments(),
        likedBy: handleLikedBy(),
        amplifiedBy: handleAmplifiedBy(),
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
