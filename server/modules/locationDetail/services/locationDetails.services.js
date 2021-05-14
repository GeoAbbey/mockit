import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";

const debugLog = debug("app:locations-details-service");

class LocationsService {
  static instance;
  static getInstance() {
    if (!LocationsService.instance) {
      LocationsService.instance = new LocationsService();
    }
    return LocationsService.instance;
  }

  async find(id) {
    debugLog("creating a location");
    return models.LocationDetail.findByPk(id);
  }

  async findOrCreate(LocationDTO) {
    debugLog("creating or returning a location");
    return models.LocationDetail.findOrCreate(LocationDTO);
  }

  async update(id, LocationDTO, oldLocation) {
    const { location, online, assigneeId, socketId } = oldLocation;

    return models.LocationDetail.update(
      {
        online: handleFalsy(LocationDTO.online, online),
        location: LocationDTO.location || location,
        socketId: LocationDTO.socketId || socketId,
        assigneeId: handleFalsy(LocationDTO.assigneeId, assigneeId),
      },
      { where: { id }, returning: true }
    );
  }

  async findLawyersWithinRadius({ longitude, latitude, radius }) {
    return models.sequelize.query(
      `SELECT "Users"."id", "Users"."firebaseToken" FROM "LocationDetails" INNER JOIN "Users" ON "LocationDetails"."id" = "Users".id WHERE ST_Distance_Sphere(location, ST_MakePoint(:longitude,:latitude)) <= :radius * 1000 AND "LocationDetails"."online" = true AND "Users"."role" = 'lawyer'`,
      {
        type: QueryTypes.SELECT,
        replacements: { longitude, latitude, radius },
      }
    );
  }
}

export default LocationsService.getInstance();
