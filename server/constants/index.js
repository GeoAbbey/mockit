const created = (context) => ({
  notification: {
    title: `${context} Created`,
    body: "kindly indicated interest to get assigned to the case",
  },
});

const completed = (context) => ({
  notification: {
    title: `${context} Completed`,
    body: `Lawyer has marked ${context.toLowerCase()} as completed kindly drop a review`,
  },
});

export const NOTIFICATION_DATA = {
  INVITATION: {
    ASSIGNED: {
      notification: {
        title: "Lawyer Assigned",
        body: "Lawyer has been assigned to the police invitation",
      },
    },
    CREATED: created("Police Invitation"),
    MARK_AS_COMPLETED: completed("Police Invitation"),
  },
  RESPONSE: {
    ASSIGNED: {
      notification: {
        title: "Lawyer Assigned",
        body: "Lawyer has been assigned to the emergency Response",
      },
    },
    MEET_TIME: {
      notification: {
        title: "Meet Time",
        body: "Lawyer has indicated that he has met with you.",
      },
    },
    CREATED: created("Emergency Response"),
    MARK_AS_COMPLETED: completed("Emergency Response"),
  },
  SMALL_CLAIM: {
    MARK_INTEREST: {
      notification: {
        title: "Lawyer Indicated Interest",
        body:
          "A Lawyer has indicated interest to the small claim you created kindly check reviews and assign the case",
      },
    },
    CREATED: created("Small Claim"),
    MARK_AS_COMPLETED: completed("Small Claim"),
    ASSIGNED: {
      notification: {
        title: "Case Assigned",
        body: "You have been assigned a small claim kindly proceed with it execution",
      },
    },
  },

  REVIEW: (context, action) => ({
    notification: {
      title: `Review ${action.toLowerCase()}`,
      body: `A review has been ${action.toLowerCase()} for the ${context} you are associated with`,
    },
  }),
};

export const EVENT_IDENTIFIERS = {
  INVITATION: {
    CREATED: "INVITATION_CREATED",
    ASSIGNED: "INVITATION_ASSIGNED",
    MARK_AS_COMPLETED: "INVITATION_MARK_AS_COMPLETED",
  },
  REVIEW: {
    CREATED: "REVIEW_CREATED",
    EDITED: "REVIEW_EDITED",
    DELETED: "REVIEW_DELETED",
  },
  SMALL_CLAIM: {
    CREATED: "SMALL_CLAIM_CREATED",
    ASSIGNED: "SMALL_CLAIM_ASSIGNED",
    MARK_INTEREST: "SMALL_CLAIM_MARK_INTEREST",
    MARK_AS_COMPLETED: "SMALL_CLAIM_MARK_AS_COMPLETED",
  },
  RESPONSE: {
    CREATED: "RESPONSE_CREATED",
    ASSIGNED: "RESPONSE_ASSIGNED",
    MEET_TIME: "MEET_TIME_CREATED",
    MARK_AS_COMPLETED: "RESPONSE_MARK_AS_COMPLETED",
  },
};

export const ROLES = {
  LAWYER: "lawyer",
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};
