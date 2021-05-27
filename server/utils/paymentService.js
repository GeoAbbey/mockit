const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];

export const payStack = (request) => {
  return {
    initializePayment: (form, myCallback) => {
      const options = {
        url: "https://api.paystack.co/transaction/initialize",
        headers: {
          authorization: config.payStackSecretKey,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
        form,
      };
      const callback = (error, response, body) => {
        return myCallback(error, body);
      };
      request.post(options, callback);
    },
    verifyPayment: (ref, myCallback) => {
      const options = {
        url: "https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref),
        headers: {
          authorization: config.payStackSecretKey,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      };
      const callback = (error, response, body) => {
        return myCallback(error, body);
      };
      request(options, callback);
    },
  };
};
