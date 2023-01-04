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
                  where: { type: "response", modelId: id },
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

  async findMany(filter, pageDetails, canApply = undefined) {
    debugLog(
      `retrieving responses with the following filter ${JSON.stringify(filter)} and ${canApply}`
    );

    const defaultSearch = [
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
    ];

    if (canApply) {
      defaultSearch.push(canApply(models.EligibleLawyer));
    }

    return models.Response.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: { ...filter },
      ...paginate(pageDetails),
      include: defaultSearch,
    });
  }

  async update(id, ResponseDTO, oldResponse, t = undefined) {
    const { status, assignedLawyerId, paid, isNotified } = oldResponse;

    if (ResponseDTO.meetTime) return this.handleMeeTime(oldResponse);
    if (ResponseDTO.bid) return this.handleBid(ResponseDTO, oldResponse);
    return models.Response.update(
      {
        status: ResponseDTO.status || status,
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

  async handleMeeTime(oldResponse) {
    const {
      dataValues: { ownerId, assignedLawyerId },
    } = oldResponse;

    const userLocCoords = await models.LocationDetail.findByPk(ownerId);
    const lawyerLocCoords = await models.LocationDetail.findByPk(assignedLawyerId);
    try {
      return models.sequelize.transaction(async (t) => {
        await userLocCoords.update(
          {
            assigningId: null,
            currentResponseId: null,
            online: false,
          },
          { transaction: t }
        );

        await lawyerLocCoords.update(
          {
            assigningId: null,
            currentResponseId: null,
          },
          { transaction: t }
        );

        return oldResponse.update(
          {
            meetTime: new Date().toISOString(),
          },
          { transaction: t }
        );
      });
    } catch (error) {
      console.log({ error });
    }
  }

  async handleBid(ResponseDTO, oldResponse) {
    const {
      dataValues: { ownerId, id },
    } = oldResponse;

    const userLocCoords = await models.LocationDetail.findByPk(ownerId);
    const lawyerLocCoords = await models.LocationDetail.findByPk(ResponseDTO.assignedLawyerId);

    try {
      return models.sequelize.transaction(async (t) => {
        await userLocCoords.update(
          {
            assigningId: ResponseDTO.assignedLawyerId,
          },
          { transaction: t }
        );

        await lawyerLocCoords.update(
          {
            assigningId: ownerId,
            currentResponseId: id,
          },
          { transaction: t }
        );

        return oldResponse.update(
          {
            assignedLawyerId: ResponseDTO.assignedLawyerId,
            status: "in-progress",
          },
          { transaction: t }
        );
      });
    } catch (error) {
      console.log({ error });
    }
  }
}

export default ResponsesService.getInstance();
