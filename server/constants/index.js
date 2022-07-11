export const generic = ({
  title,
  body,
  sender_firebase_token,
  sender_id,
  status_id,
  sender_name,
  receiver_role,
  view,
  status,
  click_action,
  ...rest
}) => ({
  notification: {
    title,
    body,
  },
  data: {
    sender_id,
    sender_name,
    status_id,
    sender_firebase_token,
    receiver_role,
    status,
    view,
    click_action,
    google_sent_time: new Date().toISOString(),
    ...rest,
  },
});

export const NOTIFICATION_DATA = {
  RESPONSE: {
    CREATED: ({ sender_id, status_id, sender_name, sender_firebase_token, ...rest }) =>
      generic({
        title: "New Emergency Response",
        body: "Kindly Indicate Interest to get assigned to the case",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "lawyer_emergency_response_screen",
        status: "emergency_response",
        click_action: "create_emergency_response",
        ...rest,
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

  ONE_TIME_SUBSCRIPTION_FEE: ({ id, amount }) => ({
    notification: {
      title: `One TIme Subscription`,
      body: `A ont time subscription fee of ${amount} has been charged on your account`,
    },
    data: {
      click_action: "user_requesting",
      id,
      status: "one time subscription fee",
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
    ADMIN_ASSIGN_LAWYER: "INVITATION_ADMIN_ASSIGN_LAWYER",
  },
  REVIEW: {
    CREATED: "REVIEW_CREATED",
    EDITED: "REVIEW_EDITED",
    DELETED: "REVIEW_DELETED",
  },
  SMALL_CLAIM: {
    CREATED: "SMALL_CLAIM_CREATED",
    PAID: "SMALL_CLAIM_PAID",
    ASSIGNED: "SMALL_CLAIM_ASSIGNED",
    MARK_INTEREST: "SMALL_CLAIM_MARK_INTEREST",
    MARK_AS_IN_PROGRESS: "SMALL_CLAIM_MARK_AS_IN_PROGRESS",
    MARK_AS_COMPLETED: "SMALL_CLAIM_MARK_AS_COMPLETED",
  },
  RESPONSE: {
    CREATED: "RESPONSE_CREATED",
    DELETED: "RESPONSE_DELETED",
    ASSIGNED: "RESPONSE_ASSIGNED",
    MEET_TIME: "MEET_TIME_CREATED",
    MARK_AS_COMPLETED: "RESPONSE_MARK_AS_COMPLETED",
  },
  COOPERATE: {
    CREATED: "COOPERATE_CREATED",
  },
  COOPERATE_ACCESS: {
    GRANTED: "COOPERATE_ACCESS_GRANTED",
    REVOKED: "COOPERATE_ACCESS_REVOKED",
  },
  USER: {
    CREATED: "USER_CREATED",
    GENERATE_NEW_OTP: "USER_GENERATE_NEW_OTP",
  },

  WITHDRAWAL: {
    INITIATED: "WITHDRAWAL_INITIATED",
    AUTHORIZED: "WITHDRAWAL_AUTHORIZED",
  },

  ONE_TIME_SUBSCRIPTION_FEE: {
    AUTHORIZED: "ONE_TIME_SUBSCRIPTION_FEE_AUTHORIZED",
  },
};

export const ROLES = {
  LAWYER: "lawyer",
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const TEMPLATE = {
  SMALL_CLAIM_STARTED: "Small_Claims_Started",
  SMALL_CLAIM_INTEREST: "Small_Claim_Interest",
  SMALL_CLAIM_COMPLETED: "Small_Claims_Completed",
  SMALL_CLAIM_CREATED: "Small_Claim_Created",
  SMALL_CLAIM_ASSIGNED: "Small_Claim_Assigned",
  ELIGIBLE_LAWYERS: "Eligible_Lawyers",
  RESPONSE_LAWYER_ASSIGNED: "Response_Lawyer_Assigned",
  RESPONSE_MEET_TIME: "Response_MeetTime",
  RESPONSE_COMPLETED: "Response_Completed",
  REVIEW_CREATED: "New_Rating",
  POLICE_INVITATION_COMPLETED: "Police_Invitation_Completed",
  POLICE_INVITATION_CREATED: "Police_Invitation_Created",
  INVITATION_LAWYER_ASSIGNED: "Invitation_Lawyer_Assigned",
  COOPERATE_ACCESS_GRANTED: "Access_Granted",
  COOPERATE_ACCESS_REVOKED: "Access_Revoked",
  LAWYER_SIGNUP: "Lawyer_signup",
  USER_SIGNUP: "User_signup",
  ADMIN_CREATED: "Admin_created",
  OTP_RESET_PASSWORD: "Otp_Reset_Password",
  OTP_VERIFY_EMAIL: "Otp_Verify_Email",
  NOTIFY_ADMIN: "Notify_Admin",
  WITHDRAWAL_INITIATED: "Withdrawal_Initiated",
  WITHDRAWAL_AUTHORIZED: "Withdrawal_Authorized",
  ONE_TIME_SUBSCRIPTION_FEE: "One_Time_Subscription_Fee",
  PERSONAL_WALLET_CREDITED: "Personal_Wallet_Credited",
  COOPERATE_WALLET_CREDITED: "Cooperate_Wallet_Credited",
  RESPONSE_SUBSCRIPTION_PAYMENT: "Response_Subscription_Payment",
  SINGLE_INVITATION_PAYMENT: "Single_Invitation_Payment",
  SINGLE_SMALL_CLAIM_PAYMENT: "Single_Small_Claim_Payment",
};
