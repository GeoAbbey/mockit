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
      var fullPath = "attachments/" + file.originalname; //If you want to save into a folder concat de name of the folder to the path
      callBack(null, fullPath);
    },
    limits: { fileSize: 2000000 },
    metadata: (req, file, callBack) => {
      callBack(null, { fieldName: file.fieldname });
    },
  }),
});

export const uploadMiddleware = (context = [{ name: "attachments", maxCount: 10 }]) => {
  return async (req, res, next) => {
    const use = uploadS3.fields([...context]);
    use(req, res, (error) => {
      logger("the upload middleware has been initialized");
      if (req.files === undefined || Object.keys(req.files).length === 0) {
        logger("no files to upload");
        return next();
      }

      if (error) return next(createError(500, "There was a problem with S3 upload servers", error));

      if (context[0].name === "attachments") {
        let fileArray = req.files.attachments;

        const images = [];
        for (let i = 0; i < fileArray.length; i++) {
          images.push({ url: fileArray[i].location, name: fileArray[i].originalname });
        }
        req.attachments = images;
      }
      return next();
    });
  };
};
