import debug from "debug";
import createError from "http-errors";
import axios from "axios";
import { compareAsc } from "date-fns";

import UsersService from "../service/user.service";
import Authenticate from "../../../utils/handleJwt";
import { HandlePassword, otp } from "../../../utils";
import { parseISO } from "date-fns/esm";
import { EVENT_IDENTIFIERS } from "../../../constants";

const envs = process.env.NODE_ENV || "development";

import configOptions from "../../../config/config";
const config = configOptions[envs];

import { Op } from "sequelize";
import { paginate as pagination } from "../../helpers";
import { smsService } from "../../../utils/smsServices";
import { applicationMappers, messageTemplateMappers } from "../../../utils/smsServices/mappers";

const log = debug("app:users-controller");
const SMSService = smsService(axios);

class UsersController {
  static instance;
  static getInstance() {
    if (!UsersController.instance) {
      UsersController.instance = new UsersController();
    }
    return UsersController.instance;
  }

  signUp = async (req, res) => {
    const eventEmitter = req.app.get("eventEmitter");
    log("creating a user");

    const hash = await HandlePassword.getHash(req.body.password);
    req.body.password = hash;

    req.body.email = req.body.email.trim();
    req.body.firstName = req.body.firstName.trim();
    req.body.lastName = req.body.lastName.trim();

    const user = await UsersService.create(req.body);
    delete user.dataValues.password;
    const token = await Authenticate.signToken(user.dataValues);

    eventEmitter.emit(EVENT_IDENTIFIERS.USER.CREATED, { user });

    return res.status(201).send({
      success: true,
      message: `${req.body.role} successfully created`,
      token,
    });
  };

  createAnAdmin = async (req, res, next) => {
    req.body.password = config.lawyerPassword;
    req.body.isVerified = true;

    return this.signUp(req, res, next);
  };

  async login(req, res, next) {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    log(`login in an existing user with email ${email}`);
    const user = await UsersService.findOne({ email });
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

  async getNoOfDistinctUsers(req, res, next) {
    const result = await UsersService.noOfDistinctUsers();

    return res.status(200).send({
      success: true,
      message: "data successfully retrieved",
      result,
    });
  }

  async getNoOfActiveUsers(req, res, next) {
    const result = await UsersService.noOfActiveUsers();

    return res.status(200).send({
      success: true,
      message: "data successfully retrieved",
      result,
    });
  }

  async changePassword(req, res, next) {
    let {
      body: { newPassword, password },
      decodedToken: { email, id },
    } = req;
    log(`changing password for a user with email ${email}`);
    const user = await UsersService.findOne({ email });
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

  handleUploads(req) {
    const { body } = req;
    const newBody = {
      lawyer: {
        documents: {},
      },
      ...body,
    };

    if (req.files) {
      var {
        files: { profilePic, link },
      } = req;
    }

    if (profilePic && profilePic[0]) {
      newBody.profilePic = profilePic[0].location;
    }

    if (link && link[0]) {
      newBody.lawyer.documents.link = link[0].location;
      newBody.lawyer.isVerified = "in-progress";
    }

    return newBody;
  }

  updateUser = async (req, res) => {
    const {
      params: { id = req.decodedToken.id },
      user,
    } = req;
    log(`updating the details of user with id ${id}`);

    const [, [User]] = await UsersService.update(id, this.handleUploads(req), user);
    delete User.dataValues.password;
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "user successfully updated",
      token,
    });
  };

  async verifyEmail(req, res, next) {
    const {
      params: { id = req.decodedToken.id },
      user,
      body,
    } = req;
    log(`verifying otp details of user with id ${id}`);

    let data = {
      settings: {
        isEmailVerified: true,
      },
    };
    const [, [User]] = await UsersService.update(id, data, user);
    delete User.dataValues.password;
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "email successfully verified",
      token,
    });
  }

  async verifyPhoneNumber(req, res, next) {
    const {
      body: { otp },
      user: {
        id,
        settings: {
          isPhone: { pinId },
        },
      },
    } = req;
    log(`verifying pin details of user with id ${id}`);

    const { response } = await SMSService.verifyPhone({ pin: otp }, pinId);
    if (!response.verified) return next(createError(400, "Something went wrong, try again later"));

    const [, [User]] = await UsersService.update(
      id,
      { settings: { isEmailVerified: true, isPhone: { verified: response.verified } } },
      req.user
    );

    delete User.dataValues.password;
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "phone successfully verified",
      token,
    });
  }

  async generateNewOtp(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const { user, body, query } = req;
    log(`Generating new otp for user with email ${body.email}`);
    body.otp = otp();
    const [, [theUser]] = await UsersService.update(user.id, body, user);

    eventEmitter.emit(EVENT_IDENTIFIERS.USER.GENERATE_NEW_OTP, { user: theUser, query });

    res.status(200).send({
      message: "new OTP successfully generated",
      success: true,
    });
  }

  async generateNewPin(req, res, next) {
    const {
      user: { phone, id },
    } = req;
    log(`Generating new pin for user with phone ${phone}`);

    const response = await SMSService.send2FAPin({
      to: phone,
      applicationId: applicationMappers.verifyPhoneId,
      messageId: messageTemplateMappers.verifyPhoneMessageId,
      from: "App Rescue",
    });

    if (!response.success) return next(createError(500, "Something went wrong. Try again later"));
    const {
      response: { pinId },
    } = response;

    await UsersService.update(id, { settings: { isPhone: { pinId } } }, req.user);

    res.status(200).send({
      ...response,
      message: "new PIN successfully generated",
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
        (req.body && req.body.email && { email: req.body.email }) ||
        (req.body && req.body.phone && { phone: req.body.phone });

      if (!identifier) return next(createError(403, "means of identification must be supplied"));
      log(`validating that user with identifier ${identifier} exists`);
      const user =
        req.body.email || req.body.phone
          ? await UsersService.findOne({ ...identifier })
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
    const {
      filter,
      query: { paginate = {} },
    } = req;
    const users = await UsersService.retrieveAll(filter, paginate);

    const { offset, limit } = pagination(paginate);

    return res.status(200).send({
      success: true,
      message: "user successfully retrieved",
      users: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...users,
      },
    });
  }

  async queryContext(req, res, next) {
    log("creating query context from available options");
    const { query } = req;

    let filter = {};

    if (query.search && query.search.role) {
      filter = { ...filter, role: query.search.role };
    }

    if (query.search && query.search.name) {
      filter = {
        ...filter,
        [Op.or]: [
          {
            firstName: { [Op.iLike]: `%${query.search.name}%` },
          },
          {
            lastName: { [Op.iLike]: `%${query.search.name}%` },
          },
          { email: { [Op.iLike]: `%${query.search.name}%` } },

          { phone: { [Op.iLike]: `%${query.search.name}%` } },
        ],
      };
    }

    if (query.search && query.search.gender) {
      filter = { ...filter, gender: query.search.gender };
    }

    req.filter = filter;
    return next();
  }
}

export default UsersController.getInstance();
