import debug from "debug";
import createError from "http-errors";
import { compareAsc } from "date-fns";

import UsersService from "../service/user.service";
import Authenticate from "../../../utils/handleJwt";
import { HandlePassword, otp } from "../../../utils";
import { parseISO } from "date-fns/esm";
import { EVENT_IDENTIFIERS } from "../../../constants";

import { Op } from "sequelize";
import { process } from "../../../utils/processInput";
import { paginate as pagination } from "../../helpers";

const log = debug("app:users-controller");

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
    req.body.gender = process(req.body.gender);
    req.body.phone = process(req.body.phone);

    const user = await UsersService.create(req.body);
    delete user.dataValues.password;
    const token = await Authenticate.signToken(user.dataValues);

    eventEmitter.emit(EVENT_IDENTIFIERS.USER.CREATED, { user });

    return res.status(201).send({
      success: true,
      message: "user successfully created",
      token,
    });
  };

  createAnAdmin = async (req, res, next) => {
    req.body.password = "Zapp101";
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
      guarantors: {
        nextOfKin: {},
        surety: {},
      },
      lawyer: {
        documents: {},
      },
      ...body,
    };

    if (req.files) {
      var {
        files: {
          profilePic,
          nextOfKinProfilePic,
          suretyProfilePic,
          photoIDOrNIN,
          NBAReceipt,
          callToBarCertificate,
          LLBCertificate,
          others,
        },
      } = req;
    }

    if (profilePic && profilePic[0]) {
      newBody.profilePic = profilePic[0].location;
    }

    if (nextOfKinProfilePic && nextOfKinProfilePic[0]) {
      newBody.guarantors.nextOfKin.profilePic = nextOfKinProfilePic[0].location;
    }

    if (others && others[0]) {
      newBody.lawyer.documents.others = {
        url: others[0].location,
        name: others[0].originalname,
        type: others[0].mimetype,
      };
    }

    if (NBAReceipt && NBAReceipt[0]) {
      newBody.lawyer.documents.NBAReceipt = {
        url: NBAReceipt[0].location,
        name: NBAReceipt[0].originalname,
        type: NBAReceipt[0].mimetype,
      };
    }

    if (LLBCertificate && LLBCertificate[0]) {
      newBody.lawyer.documents.LLBCertificate = {
        url: LLBCertificate[0].location,
        name: LLBCertificate[0].originalname,
        type: LLBCertificate[0].mimetype,
      };
    }

    if (callToBarCertificate && callToBarCertificate[0]) {
      newBody.lawyer.documents.callToBarCertificate = {
        url: callToBarCertificate[0].location,
        name: callToBarCertificate[0].originalname,
        type: callToBarCertificate[0].mimetype,
      };
    }

    if (photoIDOrNIN && photoIDOrNIN[0]) {
      newBody.lawyer.documents.photoIDOrNIN = {
        url: photoIDOrNIN[0].location,
        name: photoIDOrNIN[0].originalname,
        type: photoIDOrNIN[0].mimetype,
      };
    }

    if (suretyProfilePic && suretyProfilePic[0]) {
      newBody.guarantors.surety.profilePic = suretyProfilePic[0].location;
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
        ? await UsersService.findOne({ email: identifier })
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
