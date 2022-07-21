import { generic } from "../../../constants";

export const data = {
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
      title: "Consultation Paid",
      body: "Consultation has have been paid for kindly proceed with the execution",
      sender_firebase_token,
      sender_id,
      status_id,
      sender_name,
      receiver_role: "lawyer",
      view: "lawyer_small_claim_detail_screen",
      status: "small_claim",
      click_action: "user_choose_me_for_claim",
    }),
  CONSULTATION_COMPLETED: ({ sender_id, sender_name, status_id, sender_firebase_token }) =>
    generic({
      title: "Consultation Completed",
      body: "Lawyer has completed consultation on claim kindly review the service rendered",
      sender_firebase_token,
      sender_id,
      status_id,
      sender_name,
      receiver_role: "user",
      view: "lawyer_small_claim_detail_screen",
      status: "small_claim",
      click_action: "lawyer_complete_consultation",
    }),
  CANCELLED: ({ sender_id, sender_name, status_id, sender_firebase_token }) =>
    generic({
      title: "Claim Cancelled",
      body: "Consultation has have been paid for kindly proceed with the execution",
      sender_firebase_token,
      sender_id,
      status_id,
      sender_name,
      receiver_role: "lawyer",
      view: "lawyer_small_claim_detail_screen",
      status: "small_claim",
      click_action: "user_choose_me_for_claim",
    }),
};
