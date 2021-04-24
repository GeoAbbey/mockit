import debug from "debug";
import { add } from "date-fns";
const debugLog = debug("app:utils:otp");

export const otp = () => {
  debugLog("Generating otp");
  return {
    value: parseInt((Math.random() * 10000000).toString().substring(0, 6)),
    expiresIn: add(new Date(), {
      minutes: 10,
    }),
  };
};
