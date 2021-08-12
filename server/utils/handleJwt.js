import jwt from "jsonwebtoken";
import debug from "debug";
import createError from "http-errors";
import UsersService from "../modules/users/service/user.service";

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

  verifyToken(context) {
    return async (req, res, next) => {
      const token = req.headers.authorization;
      if (!token) {
        return next(createError(401, "Please provide a token"));
      }
      debugLog(`verifying token with token ${token}`);
      try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const theUser = await UsersService.findByPk(decodedToken.id);
        if (!theUser)
          return next(
            createError(
              401,
              "Invalid Email or Password, Kindly contact the admin if this is an anomaly"
            )
          );

        if (theUser.dataValues.isAccountSuspended)
          return next(createError(401, "You account has been suspended kindly contact the admin"));

        if (context !== "verify" && !theUser.dataValues.isVerified)
          return next(createError(401, "Kindly verify your email address to continue"));
        req.userToken = token;
        req.decodedToken = decodedToken;
        return next();
      } catch (error) {
        return next(createError(401, "Token is not valid", error));
      }
    };
  }
}

export default Authenticate.getInstance();
