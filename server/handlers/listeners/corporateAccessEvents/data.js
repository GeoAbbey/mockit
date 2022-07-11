import { generic } from "../../../constants";

export const data = {
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
};
