import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();
import configOptions from "../../config/config";

const env = process.env.NODE_ENV || "development";
const config = configOptions[env];

export const AWS_CONFIG = {
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
};

const AWS_SES = new AWS.SES(AWS_CONFIG);

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

const bulkEmail = ({ personalizations, templateId }) => ({
  personalizations: personalizations,
  from: {
    email: "no-reply@aptresponse.io",
  },
  reply_to: {
    email: "nno-reply@aptresponse.io",
  },
  template_id: templateId,
});

export const sendBulkMail = ({ personalizations, templateId }) => {
  config.runEmailNotificationService && sgMail.send(bulkEmail({ personalizations, templateId }));
};
