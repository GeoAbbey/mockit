import { UserRoutes } from "./users/users.routes.config";

const routes = [UserRoutes];

export const initializeRoutes = ({ app, path }) => {
  return routes.map((route) => new route({ app, path }));
};
