import debug from "debug";
import models from "../../../models";

const debugLog = debug("app:locations-details-service");

class LocationsService {
  static instance;
  static getInstance() {
    if (!LocationsService.instance) {
      LocationsService.instance = new LocationsService();
    }
    return LocationsService.instance;
  }

  async findOrCreate(LocationDTO) {
    debugLog("creating a location");
    return models.LocationDetail.findOrCreate(LocationDTO);
  }

  async update(id, LocationDTO, oldLocation) {
    const { location, online, assigneeDetails, socketId } = oldLocation;
    return models.LocationDetail.update(
      {
        online: LocationDTO.online || online,
        location: LocationDTO.location || location,
        socketId: LocationDTO.socketId || socketId,
        assigneeDetails: {
          socketId:
            (LocationDTO.assigneeDetails && LocationDTO.assigneeDetails.socketId) ||
            assigneeDetails.socketId,
        },
      },
      { where: { id }, returning: true }
    );
  }
}

export default LocationsService.getInstance();
