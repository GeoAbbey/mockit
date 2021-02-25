import debug from "debug";

import UsersService from "../service/user.service";
const log = debug("app:users-controller");

class UsersController {
  static instance;
  static getInstance() {
    if (!UsersController.instance) {
      UsersController.instance = new UsersController();
    }
    return UsersController.instance;
  }

  async createUser(req, res) {
    const user = await UsersService.create(req.body);
    return res.status(201).send({
      success: true,
      message: "user successfully created",
      user,
    });
  }
}

export default UsersController.getInstance();
