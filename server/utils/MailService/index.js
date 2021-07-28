import AWS from "aws-sdk";
import dotenv from "dotenv";
import debug from "debug";

dotenv.config();
const logger = debug("app:utils:mail-service:index");

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
    Source: "info@zapplawyerbeta.com.ng" /* required */,
    ReplyToAddresses: ["support@zapplawyerbeta.com.ng"],
  };

  const sendPromise = () => AWS_SES.sendEmail(params).promise();
  sendTheMail(sendPromise);
};

const sendTemplateEmail = (recipientEmail, templateName) => {
  logger("sending a personalized mail using a template");

  // Create sendTemplatedEmail params
  const params = {
    Destination: {
      /* required */
      CcAddresses: [
        "EMAIL_ADDRESS",
        /* more CC email addresses */
      ],
      ToAddresses: [recipientEmail],
    },
    Source: "info@zapplawyerbeta.com.ng" /* required */,
    Template: templateName /* required */,
    TemplateData: '{ "REPLACEMENT_TAG_NAME":"REPLACEMENT_VALUE" }' /* required */,
    ReplyToAddresses: ["support@zapplawyerbeta.com.ng"],
  };

  const sendPromise = () => AWS_SES.sendTemplatedEmail(params).promise();
  sendTheMail(sendPromise);
};

const sendBulkTemplatedEmail = (destinations, templateName) => {
  logger("sending a personalized mail using a template to multiple destinations");

  const params = {
    Source: "info@zapplawyerbeta.com.ng",
    Template: templateName,
    Destinations: makeDestinations(destinations),
    DefaultTemplateData: '{ "name":"friend", "favoriteanimal":"unknown" }',
  };

  const sendPromise = () => AWS_SES.sendBulkTemplatedEmail(params).promise();
  sendTheMail(sendPromise);
};

const sendTheMail = (the_promise) => {
  the_promise()
    .then(function (data) {
      console.log(data);
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
};

const makeDestinations = (destinations) => {
  return destinations.map((destination) => {
    return {
      Destination: {
        ToAddresses: [destination.email],
      },
      ReplacementTemplateData: `{ "firstName":${destination.firstName} }`,
    };
  });
};

export { sendMail, sendTemplateEmail, sendBulkTemplatedEmail };
