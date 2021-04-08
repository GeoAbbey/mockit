import { UserRoutes } from "./users/users.routes.config";
import { InvitationRoutes } from "./invitations/invitations.routes.config";
import { ReviewsRoutes } from "./reviews/reviews.routes.config";
import { SmallClaimRoutes } from "./small-claims/small-claims.routes.config";
import { ReportRoutes } from "./reports/reports.routes.config";
import { CommentRoutes } from "./comments/comments.routes.config";

const routes = [
  UserRoutes,
  InvitationRoutes,
  ReviewsRoutes,
  SmallClaimRoutes,
  ReportRoutes,
  CommentRoutes,
];

export const initializeRoutes = ({ app, path }) => {
  return routes.map((route) => new route({ app, path }));
};
