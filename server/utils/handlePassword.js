import bcrypt from "bcrypt";
import debug from "debug";

const debugLog = debug("app:utils:handlePassword");

class HandlePassword {
  static instance;
  saltRounds;
  constructor() {
    this.saltRounds = 10;
  }
  static getInstance() {
    if (!HandlePassword.instance) {
      HandlePassword.instance = new HandlePassword();
    }
    return HandlePassword.instance;
  }

  async getHash(plainTextPassword) {
    debugLog(`Generating hash`);
    console.log({ plainTextPassword }, "🍅", this.saltRounds);
    const hash = await bcrypt.hash(plainTextPassword, this.saltRounds);
    return hash;
  }

  async compareHash(plainTextPassword, hash) {
    debugLog("validating hash");
    const match = await bcrypt.compare(plainTextPassword, hash);
    return match;
  }
}

export default HandlePassword.getInstance();
