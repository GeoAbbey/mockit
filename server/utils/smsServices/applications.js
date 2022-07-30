import axios from "axios";
import { smsService } from "./index.js";

const SMSService = smsService(axios);

export const applications = {
  verifyPhoneNumber: {
    name: "Verify Phone Number",
    configuration: {
      pinAttempts: 10,
      allowMultiplePinVerifications: true,
      pinTimeToLive: "15m",
      verifyPinLimit: "1/3s",
      sendPinPerApplicationLimit: "10000/1d",
      sendPinPerPhoneNumberLimit: "3/1d",
    },
    enabled: true,
  },
};

const applicationID = SMSService.makeApplication(applications.verifyPhoneNumber);
console.log({ applicationID });
