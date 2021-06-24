const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];
export const payStack = (request) => {
  return {
    async initializePayment(data) {
      return this.requestBuilder("https://api.paystack.co/transaction/initialize", data, "POST");
    },
    async verifyPayment(ref) {
      return this.requestBuilder(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
        null,
        "GET"
      );
    },

    async chargeCard(data) {
      return this.requestBuilder("https://api.paystack.co/charge", data, "POST");
    },

    async createRecipient(data) {
      return this.requestBuilder("https://api.paystack.co/transferrecipient", data, "POST");
    },

    async transfer(data) {
      return this.requestBuilder("https://api.paystack.co/transfer", data, "POST");
    },

    async getBankCodes() {
      return this.requestBuilder("https://api.paystack.co/bank", null, "GET");
    },

    async deleteRecipient(authCode) {
      return this.requestBuilder(
        `https://api.paystack.co/transferrecipient/${authCode}`,
        null,
        "DELETE"
      );
    },

    async requestBuilder(url, data, method) {
      const headers = {
        Authorization: `Bearer ${config.payStackSecretKey}`,
        "Content-Type": "application/json",
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

        return { success: true, response: response.data };
      } catch (error) {
        return { success: false, response: error };
      }
    },
  };
};
