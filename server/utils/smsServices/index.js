import { applicationMappers } from "./mappers";

const config = {
  smsApiKey: "7662274f43401f25d0574769d4d32baf-06b2fa5f-746f-44b9-bbf5-b8c633b5fc5a",
  smsBaseUrl: "https://89nenr.api.infobip.com",
};

export const smsService = (request) => ({
  async makeApplication(data) {
    return this.requestBuilder(`${config.smsBaseUrl}/2fa/2/applications`, data, "POST");
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
    } catch (error) {
      console.log({ error }, error.response, "🚎");
      return { success: false, response: error };
    }
  },
});
