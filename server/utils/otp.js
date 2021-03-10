import debug from "debug";
import { add } from "date-fns";
const debugLog = debug("app:utils:otp");

export const otp = () => {
  debugLog("Generating otp");
  return {
    value: parseInt(Math.random() * 1000000),
    expiresIn: add(new Date(), {
      minutes: 10,
    }),
  };
};
