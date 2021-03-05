import debug from "debug";

import UsersService from "../service/user.service";
import Authenticate from "../../../utils/handleJwt";
import { HandlePassword } from "../../../utils";

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
    log("creating a user");
    const hash = await HandlePassword.getHash(req.body.password);
    req.body.password = hash;
    const user = await UsersService.create(req.body);
    const token = await Authenticate.signToken(user.dataValues);
    return res.status(201).send({
      success: true,
      message: "user successfully created",
      token,
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    log(`login in an existing user with id ${email}`);
    const user = await UsersService.findOne(email);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    const match = await HandlePassword.compareHash(password, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = await Authenticate.signToken(user.dataValues);
    return res.status(200).send({
      success: true,
      message: "user successfully retrieved",
      token,
      user,
    });
  }

  async updateUser(req, res) {
    const {
      params: { id = req.decodedToken.id },
      user,
      body,
    } = req;
    log(`updating the details of user with id ${id}`);
    id ? id : req.user.id;
    const [, [User]] = await UsersService.update(id, body, user);
    const token = await Authenticate.signToken(User.dataValues);
    return res.status(200).send({
      success: true,
      message: "user successfully updated",
      token,
    });
  }

  async userExistMiddleware(req, res, next) {
    const { id = req.decodedToken.id } = req.params;

    log(`validating that user with id ${id} exists`);
    const user = await UsersService.findByPk(id);
    if (!user) {
      res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    req.user = user;
    next();
  }
}

export default UsersController.getInstance();
