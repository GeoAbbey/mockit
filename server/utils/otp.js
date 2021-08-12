import debug from "debug";
import { add } from "date-fns";
const debugLog = debug("app:utils:otp");

export const otp = () => {
  debugLog("Generating otp");
  return {
    value: Math.random().toString().substring(2, 8),
    expiresIn: add(new Date(), {
      minutes: 10,
    }),
  };
};
