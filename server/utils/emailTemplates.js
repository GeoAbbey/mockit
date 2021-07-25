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
    TemplateName: "New_Rating",
    SubjectPart: "Greetings, {{firstName}}!",
    HtmlPart: `<!DOCTYPE html>
<html
  lang="en"
  style="
    font-family: 'Avenir', sans-serif !important;
    box-sizing: border-box;
    font-size: 14px;
    margin: 0;
  "
>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Review and Ratings</title>
    <style type="text/css">
      .logo {
        width: 40px;
        height: 40px;
      }
      .logo__text {
        font-weight: bold;
        /* padding-bottom: 10px; */
        display: inline;
      }
      .logo__container {
        display: flex;
        align-items: center;
      }
      .main__image img {
        width: 100%;
      }
      .content-block button {
        background: #c70039;
        color: #fff;
        border: 1px solid #c70039;
        padding: 7px 15px;
        border-radius: 30px;
        font-family: "Avenir", sans-serif !important;
        font-weight: bold;
      }
      .footer {
        background: white;
        color: #747577;
        padding: 5px 0;
      }
    </style>
  </head>
  <body
    itemscope
    itemtype="http://schema.org/EmailMessage"
    style="
      font-family: 'Avenir', sans-serif !important;
      box-sizing: border-box;
      font-size: 14px;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
      width: 100% !important;
      height: 100%;
      line-height: 1.6em;
      background: rgb(240, 240, 240, 0.6);
      margin: 0;
    "
    bgcolor="#f6f6f6"
  >
    <div class="" style="text-align: center; color: #64656a">
      <p style="font-size: 12px">View email in your browser</p>
    </div>
    <table
      class="body-wrap"
      style="
        font-family: 'Avenir', sans-serif !important;
        box-sizing: border-box;
        font-size: 14px;
        width: 100%;
        background-color: #f6f6f6;
        margin: 0;
      "
    >
      <tr
        style="
          font-family: 'Avenir', sans-serif !important;
          box-sizing: border-box;
          font-size: 14px;
          margin: 0;
        "
      >
        <td
          style="
            font-family: 'Avenir', sans-serif !important;
            box-sizing: border-box;
            font-size: 14px;
            vertical-align: top;
            margin: 0;
          "
          valign="top"
        ></td>
        <td
          class="container"
          width="600"
          style="
            font-family: 'Avenir', sans-serif !important;
            box-sizing: border-box;
            font-size: 14px;
            vertical-align: top;
            display: block !important;
            max-width: 600px !important;
            clear: both !important;
            margin: 0 auto;
          "
          valign="top"
        >
          <div
            class="content"
            style="
              font-family: 'Avenir', sans-serif !important;
              box-sizing: border-box;
              font-size: 14px;
              max-width: 600px;
              display: block;
              margin: 0 auto;
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #fff;
                padding: 10px 25px;
              "
            >
              <main class="logo__container">
                <img src="./images/logo.png" alt="logo" style="height: 30px" />
              </main>
              <a href="https://zapplawyerbeta.com.ng/contact">Contact</a>
            </div>
            <main style="margin: 0; padding: 0" class="main__image">
              <img src="./images/welcome.png" alt="image" />
            </main>
            <table
              class="main"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                font-family: 'Avenir', sans-serif !important;
                box-sizing: border-box;
                font-size: 14px;
                border-radius: 3px;
                background-color: #fff;
                margin: -10px 0 0;
                padding: 0;
              "
            >
              <tr
                style="
                  font-family: 'Avenir', sans-serif !important;
                  box-sizing: border-box;
                  font-size: 14px;
                  margin: 0;
                "
              >
                <td
                  class="content-wrap"
                  style="
                    font-family: 'Avenir', sans-serif !important;
                    box-sizing: border-box;
                    font-size: 14px;
                    vertical-align: top;
                    margin: 0;
                    padding: 40px 50px;
                  "
                  valign="top"
                >
                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      font-family: 'Avenir', sans-serif !important;
                      box-sizing: border-box;
                      font-size: 14px;
                      margin: 0;
                    "
                  >
                    <tr
                      style="
                        font-family: 'Avenir', sans-serif !important;
                        box-sizing: border-box;
                        font-size: 14px;
                        margin: 0;
                      "
                    >
                      <td
                        class="content-block"
                        style="
                          font-family: 'Avenir', sans-serif !important;
                          box-sizing: border-box;
                          font-size: 24px;
                          font-weight: 900;
                          vertical-align: top;
                          margin: 0;
                          padding: 0 0 15px;
                        "
                        valign="top"
                      >
                        New Review and Ratings
                      </td>
                    </tr>
                    <tr
                      style="
                        font-family: 'Avenir', sans-serif !important;
                        box-sizing: border-box;
                        font-size: 14px;
                        margin: 0;
                      "
                    >
                      <td
                        class="content-block"
                        style="
                          font-family: 'Avenir', sans-serif !important;
                          box-sizing: border-box;
                          font-size: 14px;
                          vertical-align: top;
                          margin: 0;
                          padding: 0 0 15px;
                        "
                        valign="top"
                      >
                        Hello {{firstName}},
                      </td>
                    </tr>
                    <tr
                      style="
                        font-family: 'Avenir', sans-serif !important;
                        box-sizing: border-box;
                        font-size: 14px;
                        margin: 0;
                      "
                    >
                      <td
                        class="content-block"
                        style="
                          font-family: 'Avenir', sans-serif !important;
                          box-sizing: border-box;
                          font-size: 14px;
                          vertical-align: top;
                          margin: 0;
                          padding: 0 0 20px;
                        "
                        valign="top"
                      >
                        You just recieved a new review and rating on the
                        Zapplawyer platform
                      </td>
                    </tr>
                    <tr
                      style="
                        font-family: 'Avenir', sans-serif !important;
                        box-sizing: border-box;
                        font-size: 14px;
                        margin: 0;
                      "
                    >
                      <td
                        class="content-block"
                        style="
                          font-family: 'Avenir', sans-serif !important;
                          box-sizing: border-box;
                          font-size: 14px;
                          vertical-align: top;
                          margin: 0;
                          padding: 0 0 15px;
                        "
                        valign="top"
                      >
                        Cheers,
                      </td>
                    </tr>
                    <tr
                      style="
                        font-family: 'Avenir', sans-serif !important;
                        box-sizing: border-box;
                        font-size: 14px;
                        margin: 0;
                      "
                    >
                      <td
                        class="content-block"
                        style="
                          font-family: 'Avenir', sans-serif !important;
                          box-sizing: border-box;
                          font-size: 14px;
                          vertical-align: top;
                          margin: 0;
                          padding: 0 0 15px;
                        "
                        valign="top"
                      >
                        From the Zapplawyer team.
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td> -->
              </tr>
            </table>
            <table
              class="main"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                font-family: 'Avenir', sans-serif !important;
                box-sizing: border-box;
                font-size: 14px;
                border-radius: 3px;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
              "
            >
              <tr
                style="
                  font-family: 'Avenir', sans-serif !important;
                  box-sizing: border-box;
                  font-size: 14px;
                  margin: 0;
                "
              >
                <td
                  class="content-wrap"
                  style="
                    font-family: 'Avenir', sans-serif !important;
                    box-sizing: border-box;
                    font-size: 14px;
                    vertical-align: top;
                    margin: 0;
                    padding: 20px;
                  "
                  valign="top"
                >
                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      font-family: 'Avenir', sans-serif !important;
                      box-sizing: border-box;
                      font-size: 14px;
                      margin: 0;
                    "
                  >
                    <tr
                      style="
                        font-family: 'Avenir', sans-serif !important;
                        box-sizing: border-box;
                        font-size: 14px;
                        margin: 0;
                      "
                    >
                      <td
                        class="content-block"
                        style="
                          font-family: 'Avenir', sans-serif !important;
                          box-sizing: border-box;
                          font-size: 14px;
                          vertical-align: top;
                          margin: 0;
                          padding: 0 0 20px;
                        "
                        valign="top"
                      >
                        This email can’t receive replies. For more information,
                        please contact our support desk
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <div class="footer" style="text-align: center">
              <p style="font-size: 12px">
                2021 Zapplawyer. All rights reserved.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    TextPart:
      "New Review and Ratings View email in your browser Contact New Review and Ratings Hello {{firstName}}, You just received a new review and rating on the Zapplawyer platform Cheers, From the Zapplawyer team. This email can’t receive replies. For more information, please contact our support desk 2021 Zapplawyer. All rights reserved.",
  },
};

AWS_SES.createTemplate(params, function (err, data) {
  if (err) console.log(err, err.stack);
  // an error occurred
  else console.log(data); // successful response
});
