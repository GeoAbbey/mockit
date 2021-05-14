import { UserRoutes } from "./users/users.routes.config";
import { InvitationRoutes } from "./invitations/invitations.routes.config";
import { ReviewsRoutes } from "./reviews/reviews.routes.config";
import { SmallClaimRoutes } from "./small-claims/small-claims.routes.config";
import { ReportRoutes } from "./reports/reports.routes.config";
import { CommentRoutes } from "./comments/comments.routes.config";
import { NotificationRoutes } from "./notifications/notifications.routes.config";
import { InterestedLawyersRoutes } from "./interestedLawyers/interested-lawyers.routes.config";
import { ResponseRoutes } from "./response/response.routes.config";
import { ReactionRoutes } from "./reactions/reactions.routes.config";
import { EligibleLawyerRoutes } from "./eligibleLawyers/eligibleLawyers.routes.config";
import { LocationDetailRoutes } from "./locationDetail/location-details.routes.config";

const routes = [
  UserRoutes,
  InvitationRoutes,
  ReviewsRoutes,
  SmallClaimRoutes,
  ReportRoutes,
  CommentRoutes,
  NotificationRoutes,
  InterestedLawyersRoutes,
  ResponseRoutes,
  ReactionRoutes,
  EligibleLawyerRoutes,
  LocationDetailRoutes,
];

export const initializeRoutes = ({ app, path }) => {
  return routes.map((route) => new route({ app, path }));
};
