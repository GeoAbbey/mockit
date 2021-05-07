import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";

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
    debugLog("creating an Response");
    return models.Response.create(ResponseDTO);
  }

  async find(id, context) {
    debugLog(`looking for a response with id ${id}`);
    // if (context) {
    //   const response = await models.Response.findByPk(id, {
    //     include: [
    //       {
    //         model: models.Review,
    //         as: "reviews",
    //         where: { modelType: "Response", modelId: id },
    //         required: false,
    //       },
    //       {
    //         model: models.User,
    //         as: "lawyerProfile",
    //         attributes: ["firstName", "lastName", "email", "profilePic"],
    //       },
    //     ],
    //   });

    //   return response;
    // }

    return models.Response.findByPk(id);
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
          attributes: ["firstName", "lastName", "email", "profilePic"],
          required: false,
        },
        {
          model: models.User,
          as: "lawyerProfile",
          attributes: ["firstName", "lastName", "email", "profilePic"],
          required: false,
        },
      ],
    });
  }

  async update(id, ResponseDTO, oldResponse) {
    const { status, meetTime, assignedLawyerId } = oldResponse;

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
        assignedLawyerId: ResponseDTO.assignedLawyerId || assignedLawyerId,
      },
      { where: { id }, returning: true }
    );
  }

  async remove(id) {
    debugLog(`deleting the response with id ${id}`);
    return models.Response.destroy({
      where: { id, assignedLawyerId: null },
    });
  }
}

export default ResponsesService.getInstance();
