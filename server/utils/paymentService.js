const env = process.env.NODE_ENV || "development";
import configOptions from "../config/config";

const config = configOptions[env];
export const payStack = (request) => {
  return {
    async initializePayment(data) {
      return this.requestBuilder(
        `${config.payment_base_url}/api/v1/merchant/transactions/init-transaction`,
        data,
        "POST"
      );
    },
    async verifyPayment(ref, data) {
      return this.requestBuilder(
        `${config.payment_base_url}/api/v2/transactions/${encodeURIComponent(ref)}`,
        data,
        "GET"
      );
    },

    async verifyRecipient(data) {
      return this.requestBuilder(
        `${config.payment_base_url}/api/v1/disbursements/account/validate?accountNumber=${data.accountNumber}&bankCode=${data.bankCode}`,
        data,
        "GET"
      );
    },

    async disbursements(data) {
      return this.requestBuilder(
        `${config.payment_base_url}/api/v2/disbursements/single`,
        data,
        "POST"
      );
    },

    async chargeCard(data) {
      return this.requestBuilder(
        `${config.payment_base_url}/api/v1/merchant/cards/charge-card-token`,
        data,
        "POST"
      );
    },

    async getBankCodes(data) {
      return this.requestBuilder(`${config.payment_base_url}/api/v1/banks`, data, "GET");
    },

    async resendOTP(data) {
      return this.requestBuilder(
        `${config.payment_base_url}/api/v2/disbursements/single/resend-otp`,
        data,
        "POST"
      );
    },

    async requestBuilder(url, data, method) {
      console.log({ data }, "monnify-token");

      const headers = {
        Authorization: `Bearer ${data.monnifyToken}`,
        "Content-Type": "application/json",
      };

      delete data.monnifyToken;

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
        console.log({ error }, error.response, "🚎");
        return { success: false, response: error };
      }
    },
  };
};
