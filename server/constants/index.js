const generic = ({
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
  INVITATION: {
    ASSIGNED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Lawyer Assigned",
        body: "A lawyer has been assigned to a case",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        status: "police_invitation",
        view: "user_police_invitation_detail_screen",
        click_action: "lawyer_shown_interest",
      }),
    CREATED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "New Police Invitation",
        body: "Kindly Indicate Interest to get assigned to the case",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "lawyer_police_invitation_screen",
        status: "police_invitation",
        click_action: "new_police_invitation_created",
      }),
    MARK_AS_COMPLETED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Police Invitation Completed",
        body: "Kindly drop a review for the lawyer",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        status: "police_invitation",
        view: "consultation_screen",
        click_action: "case_closed",
      }),
  },
  RESPONSE: {
    ASSIGNED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Emergency Response Assigned",
        body: "A Lawyer has been assigned to your emergency response",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        view: "user_emergency_response_screen",
        status: "emergency_response",
        click_action: "assigned_emergency_response",
      }),

    MEET_TIME: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Meet Time",
        body: "Lawyer has indicated that he has met with you.",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        view: "user_emergency_response_screen",
        status: "emergency_response",
        click_action: "meet_with_lawyer",
      }),
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
    MARK_AS_COMPLETED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Emergency Response Completed",
        body: "Response has been completed kindly drop a review",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        view: "consultation_screen",
        status: "emergency_response",
        click_action: "lawyer_mark_as_completed",
      }),
  },

  SMALL_CLAIM: {
    MARK_INTEREST: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Lawyer Indicated Interest",
        body:
          "A Lawyer has indicated interest to the small claim you created kindly check review, and assign the case",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        status: "small_claim",
        view: "user_small_claim_detail_screen",
        click_action: "lawyer_shown_interest",
      }),
    CREATED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "New Small Claims",
        body: "Kindly Indicate Interest to get assigned to the case",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "small_claim_screen",
        status: "small_claim",
        click_action: "new_small_claim_created",
      }),
    MARK_AS_COMPLETED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Small Claims Completed",
        body: "Kindly drop a review for the lawyer",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        view: "consultation_screen",
        status: "small_claim",
        click_action: "case_closed",
      }),
    ASSIGNED: ({ sender_id, sender_name, status_id, sender_firebase_token }) =>
      generic({
        title: "Case Assigned",
        body:
          "You have been assigned a small claim kindly proceed with it execution once payment is confirmed",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "lawyer_small_claim_detail_screen",
        status: "small_claim",
        click_action: "user_choose_me_for_claim",
      }),
    PAID: ({ sender_id, sender_name, status_id, sender_firebase_token }) =>
      generic({
        title: "Paid Claim",
        body: "Claim has have been paid for kindly proceed with it execution",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "lawyer_small_claim_detail_screen",
        status: "small_claim",
        click_action: "user_choose_me_for_claim",
      }),
    MARK_AS_IN_PROGRESS: ({ sender_id, sender_name, status_id, sender_firebase_token }) =>
      generic({
        title: "Claim Started",
        body: "Claim has have been started by assigned lawyer",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "lawyer_small_claim_detail_screen",
        status: "small_claim",
        click_action: "user_choose_me_for_claim",
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

  WITHDRAWAL: {
    INITIATED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Withdrawal Initiated",
        body: "A withdrawal has been initiated kindly approve this transaction for disbursement",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "admin",
        view: "withdrawal_initiated_screen",
        status: "withdrawal_initiated",
        click_action: "new_withdrawal_initiated",
      }),

    AUTHORIZED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
      generic({
        title: "Withdrawal Authorized",
        body:
          "Withdrawal has been authorized and funds should be available in your account shortly, kindly reach out to support in case there is any delays",
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "lawyer",
        view: "withdrawal_authorized_screen",
        status: "withdrawal_authorized",
        click_action: "new_withdrawal_authorized",
      }),
  },

  COOPERATE_ACCESS: {
    GRANTED: ({ sender_id, sender_name, status_id, sender_firebase_token }) =>
      generic({
        title: "Access Granted",
        body: `You have been granted access to use cooperate code`,
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        view: "user_cooperate_access",
        status: "cooperate_access",
        click_action: "user_choose_me_for_cooperate_access",
      }),

    REVOKED: ({ sender_id, sender_name, status_id, sender_firebase_token, ...rest }) =>
      generic({
        title: "Access Revoked",
        body: `Your access to use this cooperate code has been revoked`,
        sender_firebase_token,
        sender_id,
        status_id,
        sender_name,
        receiver_role: "user",
        view: "user_cooperate_access",
        status: "cooperate_access",
        click_action: "user_choose_me_for_cooperate_access",
      }),
  },
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
