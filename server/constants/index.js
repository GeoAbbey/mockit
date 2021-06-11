const created = ({ context, id }) => ({
  notification: {
    title: `${context} Created`,
    body: "kindly indicated interest to get assigned to the case",
  },
  data: {
    click_action: "user_requesting",
    id,
    status: "small claim assigned",
    view: "lawyer_requested_popup",
    google_sent_time: new Date().toISOString(),
  },
});

const completed = ({ context, id }) => ({
  notification: {
    title: `${context} Completed`,
    body: `Lawyer has marked ${context.toLowerCase()} as completed kindly drop a review`,
  },
  data: {
    click_action: "user_requesting",
    id,
    status: "small claim assigned",
    view: "lawyer_requested_popup",
    google_sent_time: new Date().toISOString(),
  },
});

export const NOTIFICATION_DATA = {
  INVITATION: {
    ASSIGNED: ({ id }) => ({
      notification: {
        body: "Lawyer Assigned",
        title: "A lawyer has been assigned to a case",
      },
      data: {
        click_action: "button_function",
        id,
        status: "small claim assigned",
        view: "lawyer_requested_popup",
        google_sent_time: new Date().toISOString(),
      },
    }),
    CREATED: ({ id }) => created({ context: "Police Invitation", id }),
    MARK_AS_COMPLETED: ({ id }) => completed({ context: "Police Invitation", id }),
  },
  RESPONSE: {
    ASSIGNED: ({ id }) => ({
      notification: {
        title: "Lawyer Assigned",
        body: "Lawyer has been assigned to the emergency Response",
      },
      data: {
        click_action: "user_requesting",
        id,
        status: "small claim assigned",
        view: "lawyer_requested_popup",
        google_sent_time: new Date().toISOString(),
      },
    }),
    MEET_TIME: ({ id }) => ({
      notification: {
        title: "Meet Time",
        body: "Lawyer has indicated that he has met with you.",
      },
      data: {
        click_action: "user_requesting",
        id,
        status: "small claim assigned",
        view: "lawyer_requested_popup",
        google_sent_time: new Date().toISOString(),
      },
    }),
    CREATED: ({ id }) => created({ context: "Emergency Response", id }),
    MARK_AS_COMPLETED: ({ id }) => completed({ context: "Emergency Response", id }),
  },
  SMALL_CLAIM: {
    MARK_INTEREST: ({ id }) => ({
      notification: {
        title: "Lawyer Indicated Interest",
        body:
          "A Lawyer has indicated interest to the small claim you created kindly check reviews and assign the case",
      },
      data: {
        click_action: "user_requesting",
        id,
        status: "small claim assigned",
        view: "lawyer_requested_popup",
        google_sent_time: new Date().toISOString(),
      },
    }),
    CREATED: ({ id }) => created({ context: "Small Claim", id }),
    MARK_AS_COMPLETED: ({ id }) => completed({ context: "Small Claim", id }),
    ASSIGNED: ({ id }) => ({
      notification: {
        title: "Case Assigned",
        body: "You have been assigned a small claim kindly proceed with it execution",
      },
      data: {
        click_action: "user_requesting",
        id,
        status: "small claim assigned",
        view: "lawyer_requested_popup",
        google_sent_time: new Date().toISOString(),
      },
    }),
  },

  REVIEW: ({ context, action, id }) => ({
    notification: {
      title: `Review ${action.toLowerCase()}`,
      body: `A review has been ${action.toLowerCase()} for the ${context} you are associated with`,
    },
    data: {
      click_action: "user_requesting",
      id,
      status: "small claim assigned",
      view: "lawyer_requested_popup",
      google_sent_time: new Date().toISOString(),
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
