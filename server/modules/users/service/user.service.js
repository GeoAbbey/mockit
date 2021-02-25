import { Connection } from "pg";

const UserDao = require("../../../models/").User;

class UsersService {
  static instance;
  static getInstance() {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  async create(UserDTO) {
    console.log({ UserDTO });
    return UserDao.create(UserDTO);
  }
}

export default UsersService.getInstance();
