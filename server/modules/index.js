import { UserRoutes } from "./users/users.routes.config";
import { InvitationRoutes } from "./invitations/invitations.routes.config";
const routes = [UserRoutes, InvitationRoutes];

export const initializeRoutes = ({ app, path }) => {
  return routes.map((route) => new route({ app, path }));
};
