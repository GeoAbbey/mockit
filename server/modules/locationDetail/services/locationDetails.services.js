import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";

const env = process.env.NODE_ENV || "development";

const debugLog = debug("app:locations-details-service");

class LocationsService {
  static instance;
  static getInstance() {
    if (!LocationsService.instance) {
      LocationsService.instance = new LocationsService();
    }
    return LocationsService.instance;
  }

  async find(data) {
    debugLog(`retrieving a location with the id ${JSON.stringify(data)}`);
    return models.LocationDetail.findOne(data);
  }

  async findByPk(id) {
    debugLog(`retrieving a location with the id ${JSON.stringify(id)}`);
    return models.LocationDetail.findByPk(id);
  }

  async findOrCreate(LocationDTO) {
    debugLog("creating or returning a location");
    return models.LocationDetail.findOrCreate(LocationDTO);
  }

  async update(id, LocationDTO, oldLocation) {
    const { location, online, assigningId, socketId } = oldLocation;

    return models.LocationDetail.update(
      {
        online: handleFalsy(LocationDTO.online, online),
        location: LocationDTO.location || location,
        socketId: LocationDTO.socketId || socketId,
        assigningId: handleFalsy(LocationDTO.assigningId, assigningId),
      },
      { where: { id }, returning: true }
    );
  }

  async findLawyersWithinRadius({ longitude, latitude, radius }) {
    if (env === "production") {
      debugLog("using code for production ie set SRID");
      return models.sequelize.query(
        `SELECT "Users"."id", "Users"."firebaseToken", "Users"."firstName", "Users"."email", "LocationDetails"."location" FROM "LocationDetails" INNER JOIN "Users" ON "LocationDetails"."id" = "Users".id WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(:longitude,:latitude)::geography, 4326),:radius) AND "LocationDetails"."assigningId" IS NULL AND "LocationDetails"."online" = true AND "Users"."role" = 'lawyer'`,
        {
          type: QueryTypes.SELECT,
          replacements: { longitude, latitude, radius },
        }
      );
    } else {
      debugLog("using code for development ie doesn`t set SRID");
      return models.sequelize.query(
        `SELECT "Users"."id", "Users"."firebaseToken", "Users"."firstName", "Users"."email", "LocationDetails"."location" FROM "LocationDetails" INNER JOIN "Users" ON "LocationDetails"."id" = "Users".id WHERE ST_DWithin(location,ST_MakePoint(:longitude,:latitude)::geography,:radius) AND "LocationDetails"."assigningId" IS NULL AND "LocationDetails"."online" = true AND "Users"."role" = 'lawyer'`,
        {
          type: QueryTypes.SELECT,
          replacements: { longitude, latitude, radius },
        }
      );
    }
  }
}

export default LocationsService.getInstance();
