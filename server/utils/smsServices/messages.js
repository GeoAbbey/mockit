import axios from "axios";
import { smsService } from "./index.js";

const SMSService = smsService(axios);

export const messages = {
  verifyPhoneNumber: {
    pinType: "NUMERIC",
    messageText: "Your pin is {{pin}}",
    pinLength: 6,
    language: "en",
    senderId: "aptResponse",
    repeatDTMF: "1#",
    speechRate: 1,
  },
};

const messageID = SMSService.makeMessage(messages.verifyPhoneNumber);
console.log({ messageID });
