const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();

const AWS_CONFIG = {
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
};

const AWS_SES = new AWS.SES(AWS_CONFIG);

var params = {
  Template: {
    /* required */ TemplateName: "STRING_VALUE" /* required */,
    HtmlPart: "STRING_VALUE",
    SubjectPart: "STRING_VALUE",
    TextPart: "STRING_VALUE",
  },
};

AWS_SES.createTemplate(params, function (err, data) {
  if (err) console.log(err, err.stack);
  // an error occurred
  else console.log(data); // successful response
});
