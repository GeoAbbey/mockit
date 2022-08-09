import debug from "debug";
import { QueryTypes } from "sequelize";
import models from "../../../models";
import { handleFalsy } from "../../../utils";
import axios from "axios";

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
    const { location, online, assigningId, socketId, currentResponseId, room } = oldLocation;

    const final = {
      online: handleFalsy(LocationDTO.online, online),
      location: LocationDTO.location || location,
      room: handleFalsy(LocationDTO.room, room),
      currentResponseId: handleFalsy(LocationDTO.currentResponseId, currentResponseId),
      socketId: LocationDTO.socketId || socketId,
      assigningId: handleFalsy(LocationDTO.assigningId, assigningId),
    };

    return models.sequelize.query(
      `UPDATE "LocationDetails" SET "online"=${final.online},"location"='${
        final.location
      }',"room"='${final.room}',"currentResponseId"='${final.currentResponseId}',"socketId"='${
        final.socketId
      }',"assigningId"='${
        final.assigningId
      }',"updatedAt"=${Date.now()} WHERE "id" = '${id}' RETURNING "id","socketId","speed","currentResponseId","online","meta","location","assigningId","room","createdAt","updatedAt"`,
      {
        type: QueryTypes.SELECT,
      }
    );
  }

  async statesAndCountries() {
    debugLog("calling the external api to retrieve a list of countries and associated states");

    const { data } = await axios({
      url: "https://countriesnow.space/api/v0.1/countries/states",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  }

  async findLawyersWithinRadius({ longitude, latitude, radius }) {
    if (env === "production") {
      debugLog("using code for production ie set SRID");
      return models.sequelize.query(
        `SELECT "Users"."id", "Users"."firebaseToken", "Users"."firstName", "Users"."email", "LocationDetails"."location" FROM "LocationDetails" INNER JOIN "Users" ON "LocationDetails"."id" = "Users".id WHERE ST_DWithin((location)::geography, ST_SetSRID(ST_MakePoint(:longitude,:latitude)::geography, 4326),:radius) AND "LocationDetails"."assigningId" IS NULL AND "LocationDetails"."online" = true AND "Users"."role" = 'lawyer' LIMIT 10`,
        {
          type: QueryTypes.SELECT,
          replacements: { longitude, latitude, radius },
        }
      );
    } else {
      debugLog("using code for development ie doesn`t set SRID");
      return models.sequelize.query(
        `SELECT "Users"."id", "Users"."firebaseToken", "Users"."firstName", "Users"."email", "LocationDetails"."location" FROM "LocationDetails" INNER JOIN "Users" ON "LocationDetails"."id" = "Users".id WHERE ST_DWithin((location)::geography,ST_MakePoint(:longitude,:latitude)::geography,:radius) AND "LocationDetails"."assigningId" IS NULL AND "LocationDetails"."online" = true AND "Users"."role" = 'lawyer' LIMIT 10`,
        {
          type: QueryTypes.SELECT,
          replacements: { longitude, latitude, radius },
        }
      );
    }
  }
}

export default LocationsService.getInstance();
