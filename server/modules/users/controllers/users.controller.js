import debug from "debug";
import createError from "http-errors";
import { compareAsc } from "date-fns";

import UsersService from "../service/user.service";
import Authenticate from "../../../utils/handleJwt";
import { HandlePassword, otp } from "../../../utils";
import { parseISO } from "date-fns/esm";
import { EVENT_IDENTIFIERS } from "../../../constants";

const log = debug("app:users-controller");

class UsersController {
  static instance;
  static getInstance() {
    if (!UsersController.instance) {
      UsersController.instance = new UsersController();
    }
    return UsersController.instance;
  }

  async signUp(req, res) {
    const eventEmitter = req.app.get("eventEmitter");
    log("creating a user");

    const hash = await HandlePassword.getHash(req.body.password);
    req.body.password = hash;
    req.body.email = req.body.email.trim().toLowerCase();

    const user = await UsersService.create(req.body);
    delete user.dataValues.password;
    const token = await Authenticate.signToken(user.dataValues);

    eventEmitter.emit(EVENT_IDENTIFIERS.USER.CREATED, { user });

    return res.status(201).send({
      success: true,
      message: "user successfully created",
      token,
    });
  }

  async login(req, res, next) {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    log(`login in an existing user with email ${email}`);
    const user = await UsersService.findOne(email);
    if (!user) return next(createError(404, "User not found"));

    const match = await HandlePassword.compareHash(password, user.password);
    if (!match) return next(createError(400, "Invalid email or password"));

    delete user.dataValues.password;
    const token = await Authenticate.signToken(user.dataValues);

    return res.status(200).send({
      success: true,
      message: "user successfully retrieved",
      token,
    });
  }

  async changePassword(req, res, next) {
    let {
      body: { newPassword, password },
      decodedToken: { email, id },
    } = req;
    log(`changing password for a user with email ${email}`);
    const user = await UsersService.findOne(email);
    if (!user) return next(createError(404, "User not found"));

    const match = await HandlePassword.compareHash(password, user.password);
    if (!match) return next(createError(400, "Invalid email or password"));

    const hash = await HandlePassword.getHash(newPassword);
    const [, [newUser]] = await UsersService.update(id, { password: hash }, user);
    delete newUser.dataValues.password;

    const token = await Authenticate.signToken(newUser.dataValues);

    return res.status(200).send({
      success: true,
      message: "password successfully updated",
      token,
    });
  }

  async updateUser(req, res) {
    const {
      params: { id = req.decodedToken.id },
      user,
      body,
    } = req;

    if (req.files) {
      var {
        files: { profilePic, nextOfKinProfilePic, suretyProfilePic },
      } = req;
    }
    log(`updating the details of user with id ${id}`);

    if (profilePic && profilePic[0]) {
      body.profilePic = profilePic[0].location;
    }
    if (nextOfKinProfilePic && nextOfKinProfilePic[0]) {
      body.guarantors = {
        ...body.guarantors,
        nextOfKin: {
          profilePic: nextOfKinProfilePic[0].location,
        },
      };
    }
    if (suretyProfilePic && suretyProfilePic[0]) {
      body.guarantors = {
        ...body.guarantors,
        surety: {
          profilePic: suretyProfilePic[0].location,
        },
      };
    }
    const [, [User]] = await UsersService.update(id, body, user);
    delete User.dataValues.password;
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "user successfully updated",
      token,
    });
  }

  async verifyEmail(req, res, next) {
    const {
      params: { id = req.decodedToken.id },
      user,
      body,
    } = req;
    log(`verifying otp details of user with id ${id}`);

    body.isVerified = true;
    const [, [User]] = await UsersService.update(id, body, user);
    delete User.dataValues.password;
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "email successfully verified",
      token,
    });
  }

  async generateNewOtp(req, res, next) {
    const { user, body } = req;
    log(`Generating new otp for user with email ${body.email}`);
    body.otp = otp();
    const [, [User]] = await UsersService.update(user.id, body, user);
    res.status(200).send({
      message: "new OTP successfully generated",
      success: true,
    });
  }

  async resetPassword(req, res, next) {
    const { user, body } = req;
    log(`changing password for user with email ${body.email}`);

    body.password = await HandlePassword.getHash(body.newPassword);
    const [, [User]] = await UsersService.update(user.id, body, user);
    delete User.dataValues.password;
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "password successfully updated",
      token,
    });
  }

  async validateOTP(req, res, next) {
    log("validating OTP supplied");
    const { body } = req;
    if (body.otp != req.user.otp.value) {
      return next(createError(403, "Invalid OTP supplied"));
    }
    if (compareAsc(new Date(), parseISO(req.user.otp.expiresIn)) !== -1) {
      return next(createError(403, "supplied OTP has expired"));
    }
    return next();
  }

  async getUser(req, res, next) {
    const { user } = req;
    return res.status(200).send({
      success: true,
      message: "user successfully retrieved",
      user,
    });
  }

  userExistMiddleware(context) {
    return async (req, res, next) => {
      log("Checking that the user actually exits");
      const identifier =
        (req.params && req.params.id) ||
        (req.decodedToken && req.decodedToken.id) ||
        (req.body && req.body.email);

      if (!identifier) return next(createError(403, "means of identification must be supplied"));
      log(`validating that user with identifier ${identifier} exists`);
      const user = req.body.email
        ? await UsersService.findOne(identifier)
        : await UsersService.findByPk(identifier);

      if (user && context === "signup")
        return next(createError(409, "user with the given email already exits"));

      if (user && context === "getProfile") {
        delete user.dataValues.password;
        const token = await Authenticate.signToken(user.dataValues);
        return res.status(200).send({
          success: true,
          message: "password successfully updated",
          token,
        });
      }

      if (!context && !user) return next(createError(404, "user not found"));
      req.user = user;
      return next();
    };
  }

  async getAllUsers(req, res, next) {
    log("retrieving all the users on the platform");
    const { query } = req;
    if (!query) query = {};
    const users = await UsersService.retrieveAll(query);
    return res.status(200).send({
      success: true,
      message: "user successfully retrieved",
      users,
    });
  }
}

export default UsersController.getInstance();
