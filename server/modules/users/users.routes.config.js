import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import { schema } from "./schema/users.schema";
import { middleware } from "../utils/middleware";

export class UserRoutes extends CommonRoutesConfig {
  constructor({ app, path }) {
    super({ app, name: "UserRoutes", path });
  }

  configureRoutes() {
    this.app
      .route(`${this.path}/users`)
      .get((req, res) => {
        res.status(200).send(`List of users`);
      })
      .post([
        middleware({ schema, property: "body" }),
        UsersController.createUser,
      ]);

    this.app
      .route(`/users/:userId`)
      .all((req, res, next) => {
        next();
      })
      .get((req, res) => {
        res.status(200).send(`GET requested for id ${req.params.userId}`);
      });
    return this.app;
  }
}
