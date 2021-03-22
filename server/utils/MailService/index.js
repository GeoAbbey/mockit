import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

export const AWS_CONFIG = {
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
};

console.log(process.env.REGION, "🔥");

const AWS_SES = new AWS.SES(AWS_CONFIG);

const sendMail = ({ email, otp }) => {
  console.log({ email, otp });
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

  return AWS_SES.sendEmail(params).promise();
};

const sendTemplateEmail = (recipientEmail) => {
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
    Source: "EMAIL_ADDRESS" /* required */,
    Template: "TEMPLATE_NAME" /* required */,
    TemplateData: '{ "REPLACEMENT_TAG_NAME":"REPLACEMENT_VALUE" }' /* required */,
    ReplyToAddresses: ["EMAIL_ADDRESS"],
  };

  return AWS_SES.sendTemplatedEmail(params).promise();
};

export { sendMail, sendTemplateEmail };
