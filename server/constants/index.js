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
  },
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
    CANCELLED: "INVITATION_CANCELLED",
    MARK_AS_COMPLETED: "INVITATION_MARK_AS_COMPLETED",
    ADMIN_ASSIGN_LAWYER: "INVITATION_ADMIN_ASSIGN_LAWYER",
  },
  REVIEW: {
    CREATED: "REVIEW_CREATED",
    EDITED: "REVIEW_EDITED",
    DELETED: "REVIEW_DELETED",
  },
  MILESTONE: {
    CREATED: "MILESTONE_CREATED",
    PAID: "MILESTONE_PAID",
    COMPLETED: "MILESTONE_COMPLETED",
  },
  SMALL_CLAIM: {
    CREATED: "SMALL_CLAIM_CREATED",
    PAID: "SMALL_CLAIM_PAID",
    MARK_INTEREST: "SMALL_CLAIM_MARK_INTEREST",
    EDIT_INTEREST: "SMALL_CLAIM_EDIT_INTEREST",
    CONSULTATION_COMPLETED: "SMALL_CLAIM_CONSULTATION_COMPLETED",
    CANCELLED: "SMALL_CLAIM_CANCELLED",
    COMPLETED: "SMALL_CLAIM_COMPLETED",
    CLOSED: "SMALL_CLAIM_CLOSED",
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
  SMALL_CLAIM_STARTED: "d-d7140f98d956449d87dfa3e36fcbafc8",
  SMALL_CLAIM_INTEREST: "d-d7af6f3b9356436a94abd197aa701ca0",
  SMALL_CLAIM_COMPLETED: "d-b60f744a1de24b88acf3534079f0e547",
  SMALL_CLAIM_CREATED: "d-8be95a4b831a453183d2577c109416a3",
  SMALL_CLAIM_ASSIGNED: "d-ea664c691284482393a30f5d6067c009",
  ELIGIBLE_LAWYERS: "d-13e879f37a8b4d659019f99e8219d31c",
  RESPONSE_LAWYER_ASSIGNED: "d-878d1764347e4b26ac983cb227acb890",
  RESPONSE_MEET_TIME: "Response_MeetTime",
  RESPONSE_COMPLETED: "Response_Completed",
  REVIEW_CREATED: "d-34f2fcc0b0e74a9689dd5b6b47594645",
  POLICE_INVITATION_COMPLETED: "d-1018ea48f19f40efbcadf7aedc59087b",
  POLICE_INVITATION_CREATED: "d-ff6fb7c36e694351bacd80d957b8398e",
  INVITATION_LAWYER_ASSIGNED: "d-201ce10ce5754702882d839f06b2290a",
  COOPERATE_ACCESS_GRANTED: "Access_Granted",
  COOPERATE_ACCESS_REVOKED: "Access_Revoked",
  LAWYER_SIGNUP: "d-0efa568312e64d1aad540faa0fcda0f9",
  USER_SIGNUP: "d-58f0227487ec4d458da6d0ff7b13bf77",
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
