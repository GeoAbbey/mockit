import debug from "debug";
import createError from "http-errors";

import LocationDetailsService from "../services/locationDetails.services";
const log = debug("app:LocationDetails-controller");

class LocationDetailsController {
  static instance;
  static getInstance() {
    if (!LocationDetailsController.instance) {
      LocationDetailsController.instance = new LocationDetailsController();
    }
    return LocationDetailsController.instance;
  }

  locationDetailExits(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { id },
      } = req;
      log(`verifying that a location details with id ${id} exits`);
      const locationDetail = await LocationDetailsService.findOrCreate({
        where: {
          id,
        },
        defaults: {
          id,
          online: false,
        },
      });
      req.oldLocationDetail = locationDetail;
      return next();
    };
  }

  async getCountriesAndStates(req, res, next) {
    log("retrieving countries and the states in them");
    const result = await LocationDetailsService.statesAndCountries();

    return res.status(200).send({ ...result });
  }

  async setLocation(req, res, next) {
    const {
      body: { longitude, latitude, socketId },
      decodedToken: { id },
    } = req;

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const [, [locationDetail]] = await LocationDetailsService.specificUpdate(
      id,
      location,
      socketId
    );

    const otherHalfLocation = await LocationDetailsService.findByPk(locationDetail.assigningId);

    return res.status(200).send({
      success: true,
      message: "LocationDetail successfully updated",
      otherHalfLocation,
    });
  }

  async toggleVisibility(req, res, next) {
    const {
      oldLocationDetail,
      body: { online },
      decodedToken: { id },
    } = req;
    const [, [locationDetail]] = await LocationDetailsService.update(
      id,
      { online },
      oldLocationDetail
    );
    return res.status(200).send({
      success: true,
      message: "LocationDetail successfully updated",
      locationDetail,
    });
  }

  async getLocationDetail(req, res, next) {
    const { oldLocationDetail: locationDetail } = req;
    return res.status(200).send({
      success: true,
      message: "locationDetail  successfully updated",
      locationDetail,
    });
  }

  checkAccessLawyerAccess(context) {
    return async (req, res, next) => {
      const {
        oldLocationDetail: { id: detailsId },
        decodedToken: { role, id },
      } = req;

      if (role === "admin" || role === "super-admin") return next();
      if (role !== "lawyer")
        return next(createError(401, "You don not have permission to access this route"));
      if (detailsId !== id)
        return next(
          createError(401, `You don not have permission to ${context} this location details`)
        );
      return next();
    };
  }
}

export default LocationDetailsController.getInstance();
