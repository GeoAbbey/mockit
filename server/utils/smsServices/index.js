import dotenv from "dotenv";
import { exceptionHandler } from "../exceptionHandler.js";
import { applicationMappers } from "./mappers.js";

dotenv.config();

const config = {
  smsApiKey: process.env.SMS_API_KEY,
  smsBaseUrl: process.env.SMS_BASE_URL,
};

export const smsService = (request) => ({
  async makeApplication(data) {
    return this.requestBuilder(`${config.smsBaseUrl}/2fa/2/applications`, data, "POST");
  },

  async send2FAPin(data) {
    return this.requestBuilder(`${config.smsBaseUrl}/2fa/2/pin`, data, "POST");
  },

  async verifyPhone(data, pinId) {
    return this.requestBuilder(`${config.smsBaseUrl}/2fa/2/pin/${pinId}/verify`, data, "POST");
  },

  async makeMessage(data) {
    return this.requestBuilder(
      `${config.smsBaseUrl}/2fa/2/applications/${applicationMappers.verifyPhoneId}/messages`,
      data,
      "POST"
    );
  },

  async requestBuilder(url, data, method) {
    const headers = {
      Authorization: `App ${config.smsApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let response;

    try {
      if (method === "POST") {
        response = await request({
          method,
          url,
          data: JSON.stringify(data),
          headers,
        });
      } else if (method === "GET") {
        response = await request({ url, method: "GET", headers });
      } else {
        response = await request({ url, method: "DELETE", headers });
      }

      console.log({ response });
      return { success: true, response: response.data };
    } catch ({ response }) {
      throw new exceptionHandler({
        message: response.statusText,
        status: response.status,
        name: "SMSExceptionHandler",
      });
    }
  },
});
