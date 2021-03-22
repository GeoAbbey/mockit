import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";
import createError from "http-errors";

import debug from "debug";

import { AWS_CONFIG } from "../MailService/index";

const AWS_S3 = new AWS.S3(AWS_CONFIG);
const logger = debug("app:utils:upload-service");

const uploadS3 = multer({
  storage: multerS3({
    bucket: "zapplawyer",
    acl: "public-read",
    s3: AWS_S3,
    key: (req, file, callBack) => {
      var fullPath = "files/" + file.originalname; //If you want to save into a folder concat de name of the folder to the path
      callBack(null, fullPath);
    },
    limits: { fileSize: 2000000 },
    metadata: (req, file, callBack) => {
      callBack(null, { fieldName: file.fieldname });
    },
  }),
}).array("files", 10);

export const uploadMiddleware = async (req, res, next) => {
  uploadS3(req, res, next, (error, data) => {
    logger("the upload middleware has been initialized");
    if (!req.attachments.length) {
      logger("no files to upload");
      next();
    }

    if (error) return next(createError(500, "There was a problem with S3 upload servers"));

    let fileArray = req.attachments;
    let fileLocation;

    console.log({ data }, "🐳");

    const images = [];
    for (let i = 0; i < fileArray.length; i++) {
      fileLocation = fileArray[1].location;
      console.log("filename", fileLocation);
      images.push(fileLocation);
    }
    req.attachmentsArray = fileArray;
    locationArray = images;
    next();
  });
};
