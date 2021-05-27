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
      const { id } = req.params;
      log(`verifying that a location details with id ${id} exits`);
      const locationDetail = await LocationDetailsService.findByPk(id);
      if (!locationDetail) return next(createError(404, "The locations details can not be found"));
      req.oldLocationDetail = locationDetail;
      return next();
    };
  }

  async toggleVisibility(req, res, next) {
    const {
      oldLocationDetail,
      body: { online },
      params: { id },
    } = req;
    const [, [locationDetail]] = await LocationDetailsService.update(
      id,
      { online },
      oldLocationDetail
    );
    return res.status(200).send({
      success: true,
      message: "locationDetail  successfully updated",
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
