import { generic } from "../../../constants";

export const data = {
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
};
