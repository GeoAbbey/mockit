import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";
import { rawQueries } from "../../../utils/rawQueriers";

const debugLog = debug("app:Responses-service");

class ResponsesService {
  static instance;
  static getInstance() {
    if (!ResponsesService.instance) {
      ResponsesService.instance = new ResponsesService();
    }
    return ResponsesService.instance;
  }

  async create(ResponseDTO) {
    debugLog("creating an response");
    return models.Response.create(ResponseDTO);
  }

  async find(id, context, t = undefined) {
    debugLog(`looking for a response with id ${id}`);
    if (context)
      return models.Response.findByPk(
        id,
        {
          include: [
            {
              model: models.EligibleLawyer,
              as: "eligibleLawyers",
              required: false,
              include: [
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
                  ],
                  required: false,
                },
              ],
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
              ],
              required: false,
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
                "phone",
              ],
              required: false,
            },
          ],
        },
        t
      );

    return models.Response.findByPk(id, t);
  }

  async findMany(data) {
    debugLog(`retrieving responses with the following filter ${JSON.stringify(data)}`);
    return models.Response.findAll({
      order: [["createdAt", "DESC"]],
      data,
      include: [
        {
          model: models.User,
          as: "ownerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic", "firebaseToken", "phone"],
          required: false,
        },
      ],
    });
  }

  async update(id, ResponseDTO, oldResponse, t = undefined) {
    const { status, meetTime, assignedLawyerId, paid } = oldResponse;

    const handleMeeTime = () => {
      if (ResponseDTO.meetTime) {
        return new Date().toISOString();
      }
      return meetTime;
    };

    return models.Response.update(
      {
        status: ResponseDTO.status || status,
        meetTime: handleMeeTime(),
        paid: handleFalsy(ResponseDTO.paid, paid),
        assignedLawyerId: ResponseDTO.assignedLawyerId || assignedLawyerId,
      },
      { where: { id }, returning: true },
      t
    );
  }

  async remove(id) {
    debugLog(`deleting the response with id ${id}`);
    return models.Response.destroy({
      where: { id, assignedLawyerId: null },
    });
  }

  async stats() {
    return models.sequelize.query(rawQueries.statistics("Responses"), {
      type: QueryTypes.SELECT,
    });
  }
}

export default ResponsesService.getInstance();
