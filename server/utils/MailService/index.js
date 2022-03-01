import AWS from "aws-sdk";
import dotenv from "dotenv";
import debug from "debug";
import configOptions from "../../config/config";

dotenv.config();
const logger = debug("app:utils:mail-service:index");
const env = process.env.NODE_ENV || "development";

const config = configOptions[env];

export const AWS_CONFIG = {
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
};

const AWS_SES = new AWS.SES(AWS_CONFIG);

const sendMail = ({ email, otp }) => {
  logger("sending a personalized mail");

  let params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "HTML_FORMAT_BODY",
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the body of the email",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Hello ${otp.value}`,
      },
    },
    Source: "Zapp Lawyer <info@zapplawyerbeta.com.ng>" /* required */,
    ReplyToAddresses: ["support@zapplawyerbeta.com.ng"],
  };

  const sendPromise = () => AWS_SES.sendEmail(params).promise();
  sendTheMail(sendPromise);
};

const sendTemplateEmail = (recipientEmail, templateName, templateData, ticketId) => {
  logger("sending a personalized mail using a template");

  // Create sendTemplatedEmail params
  const params = {
    Destination: {
      /* required */
      ToAddresses: [recipientEmail],
    },
    Source: "Zapp Lawyer <info@zapplawyerbeta.com.ng>" /* required */,
    Template: templateName /* required */,
    TemplateData: JSON.stringify({ ...templateData, ticketId }) /* required */,
    ReplyToAddresses: ["support@zapplawyerbeta.com.ng"],
  };

  const sendPromise = () => AWS_SES.sendTemplatedEmail(params).promise();
  sendTheMail(sendPromise);
};

const sendBulkTemplatedEmail = (destinations, templateName, { ticketId, ...rest }) => {
  logger("sending a personalized mail using a template to multiple destinations");

  const params = {
    Source: "Zapp Lawyer <info@zapplawyerbeta.com.ng>",
    Template: templateName,
    Destinations: makeDestinations(destinations, ticketId),
    DefaultTemplateData: '{ "name":"friend" }',
  };

  const sendPromise = () => AWS_SES.sendBulkTemplatedEmail(params).promise();
  sendTheMail(sendPromise);
};

const sendTheMail = (the_promise) => {
  logger(`running email notification service: ${config.runEmailNotificationService}`);
  if (config.runEmailNotificationService) {
    the_promise()
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  }
};

const makeDestinations = (destinations, ticketId) => {
  return destinations.map((destination) => {
    return {
      Destination: {
        ToAddresses: [destination.email],
      },
      ReplacementTemplateData: `{ "firstName":${destination.firstName}, "ticketId":${ticketId} }`,
    };
  });
};

export { sendMail, sendTemplateEmail, sendBulkTemplatedEmail };