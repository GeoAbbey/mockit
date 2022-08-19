import { generic } from "../../../constants";

export const data = {
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
};
