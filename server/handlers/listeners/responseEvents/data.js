import { generic } from "../../../constants";

export const data = {
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
};
