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

  async specificUpdate(id, data, socketId) {
    debugLog("updating specific properties");
    return models.LocationDetail.update(
      { location: data, socketId },
      { where: { id }, returning: true }
    );
  }

  async update(id, LocationDTO, oldLocation) {
    const { location, online, assigningId, socketId, currentResponseId, room } = oldLocation;

    return models.LocationDetail.update(
      {
        online: handleFalsy(LocationDTO.online, online),
        location: LocationDTO.location || location,
        room: handleFalsy(LocationDTO.room, room),
        currentResponseId: handleFalsy(LocationDTO.currentResponseId, currentResponseId),
        socketId: LocationDTO.socketId || socketId,
        assigningId: handleFalsy(LocationDTO.assigningId, assigningId),
      },
      { where: { id }, returning: true }
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
    debugLog("using code for development ie doesn`t set SRID");
    return models.sequelize.query(
      `SELECT "Users"."id", "Users"."firebaseToken", "Users"."firstName", "Users"."email", "LocationDetails"."socketId", "LocationDetails"."location" FROM "LocationDetails" INNER JOIN "Users" ON "LocationDetails"."id" = "Users".id WHERE ST_DWithin((location)::geography,ST_MakePoint(:longitude,:latitude)::geography,:radius) AND "LocationDetails"."assigningId" IS NULL AND "LocationDetails"."online" = true AND "Users"."role" = 'lawyer' LIMIT 10`,
      {
        type: QueryTypes.SELECT,
        replacements: { longitude, latitude, radius },
      }
    );
  }
}

export default LocationsService.getInstance();
