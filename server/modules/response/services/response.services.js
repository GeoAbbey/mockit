import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";
import { rawQueries } from "../../../utils/rawQueriers";
import { paginate } from "../../helpers";

const debugLog = debug("app:responses-service");

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
                    "description",
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
                "description",
                "phone",
              ],
              required: false,
              include: [
                {
                  model: models.Transaction,
                  as: "paymentFromWallet",
                  where: { modelType: "response", modelId: id },
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
          ],
        },
        t
      );

    return models.Response.findByPk(id, t);
  }

  async findMany(filter, pageDetails) {
    debugLog(`retrieving responses with the following filter ${JSON.stringify(filter)}`);

    return models.Response.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
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
          model: models.User,
          as: "lawyerProfile",
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
      ],
    });
  }

  async update(id, ResponseDTO, oldResponse, t = undefined) {
    const { status, meetTime, assignedLawyerId, paid, isNotified } = oldResponse;

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
        isNotified: handleFalsy(ResponseDTO.isNotified, isNotified),
        assignedLawyerId: ResponseDTO.assignedLawyerId || assignedLawyerId,
      },
      { where: { id }, returning: true, ...t }
    );
  }

  async remove(id) {
    debugLog(`deleting the response with id ${id}`);
    return models.Response.destroy({
      where: { id, assignedLawyerId: null },
    });
  }

  async findInProgress(id) {
    return models.Response.findOne({
      where: { ownerId: id, status: "in-progress" },
    });
  }

  async stats() {
    return models.sequelize.query(rawQueries.statistics("Responses"), {
      type: QueryTypes.SELECT,
    });
  }
}

export default ResponsesService.getInstance();
