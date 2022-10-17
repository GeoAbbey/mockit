import sgMail from "@sendgrid/mail";
import configOptions from "../../config/config";
const config = configOptions[env];
const env = process.env.NODE_ENV || "development";

sgMail.setApiKey(config.sendGridApiKey);

const msg = ({ email, firstName, templateId }) => ({
  to: email,
  from: "no-reply@aptresponse.io",
  templateId,
  dynamicTemplateData: {
    firstName,
  },
});

export const sendMail = ({ email, firstName, templateId }) => {
  config.runEmailNotificationService && sgMail.send(msg({ email, firstName, templateId }));
};
