import { generic } from "../../../constants";

export const data = {
  CREATED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
    generic({
      title: "Milestones Created",
      body: "Milestones has been created for your small claim, kindly make payment",
      sender_firebase_token,
      sender_id,
      status_id,
      sender_name,
      receiver_role: "user",
      view: "user_mile_stone_created",
      status: "milestone",
      click_action: "milestone_created",
    }),

  PAID: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
    generic({
      title: "Milestone Paid",
      body: "Milestones has been created for your small claim, lawyer will proceed with execution",
      sender_firebase_token,
      sender_id,
      status_id,
      sender_name,
      receiver_role: "lawyer",
      view: "lawyer_mile_stone_paid",
      status: "milestone",
      click_action: "milestone_paid",
    }),

  COMPLETED: ({ sender_id, status_id, sender_name, sender_firebase_token }) =>
    generic({
      title: "Milestones Completed",
      body: "Milestone has been completed for your small claim",
      sender_firebase_token,
      sender_id,
      status_id,
      sender_name,
      receiver_role: "user",
      view: "mile_stone_created",
      status: "milestone",
      click_action: "milestone_completed",
    }),
};
