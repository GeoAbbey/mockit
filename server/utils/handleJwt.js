import jwt from "jsonwebtoken";
import debug from "debug";
import createError from "http-errors";

const debugLog = debug("app:utils:jwt");

class Authenticate {
  static instance;
  static getInstance() {
    if (!Authenticate.instance) {
      Authenticate.instance = new Authenticate();
    }
    
    return Authenticate.instance;
  }

  async signToken(data) {
    debugLog(`signing token with data ${data}`);
    const token = jwt.sign(data, process.env.SECRET_KEY);
    return token;
  }

  async verifyToken(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      return next(createError(401, "Please provide a token"));
    }
    debugLog(`verifying token with token ${token}`);
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
      req.userToken = token;
      req.decodedToken = decodedToken;
      return next();
    } catch (error) {
      return next(createError(401, "Token is not valid", error));
    }
  }
}

export default Authenticate.getInstance();
