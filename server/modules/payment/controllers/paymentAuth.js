import axios from "axios";
import debug from "debug";
import createError from "http-errors";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";

const config = configOptions[env];
const logger = debug("app:modules:payment:controllers:paymentAuth");

export const paymentAuthMiddleware = () => {
  return async (req, res, next) => {
    logger("Login in to get token from third party payment provider");

    let response;
    response = await axios({
      method: "POST",
      url: `${config.payment_base_url}/api/v1/auth/login/`,
      auth: {
        username: config.payment_api_key,
        password: config.payment_secret_key,
      },
    });

    if (response && response.data && response.data.requestSuccessful) {
      req.monnifyToken = response.data.responseBody.accessToken;
      return next();
    } else {
      return next(
        createError(
          503,
          "There was an error connecting to our payment provider, kindly try again later"
        )
      );
    }
  };
};
