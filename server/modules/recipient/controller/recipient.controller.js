import debug from "debug";
import createError from "http-errors";
import axios from "axios";

import RecipientsService from "../services/recipient.services";

import { payStack } from "../../../utils/paymentService";
const payment = payStack(axios);
const log = debug("app:recipients-controller");

class RecipientsController {
  static instance;
  static getInstance() {
    if (!RecipientsController.instance) {
      RecipientsController.instance = new RecipientsController();
    }
    return RecipientsController.instance;
  }

  verifyRecipient = async (req, res, next) => {
    const {
      decodedToken: { id },
      body: { account_number, bank_code },
      monnifyToken,
    } = req;
    log(`verifying account details for a user with id ${id}`);

    const recipient = await payment.verifyRecipient({
      monnifyToken,
      accountNumber: account_number,
      bankCode: bank_code,
    });

    console.log({ recipient }, "🦋");

    if (!recipient.success)
      return next(
        createError(
          400,
          { message: "There was an error verifying your bank details" },
          recipient.response
        )
      );

    res.status(201).send({
      success: true,
      message: "bank info successfully verified",
      recipient: recipient.response,
    });
  };

  makeRecipient = async (req, res, next) => {
    const {
      decodedToken: { id },
      body: { account_number, bank_code, account_name, bank_name },
    } = req;

    log(`creating a recipient for user with id ${id}`);

    const recipient = await RecipientsService.findOne({ bank_code, account_number, id });
    if (recipient)
      return next(
        createError(403, `An account info with the existing information has already been created`)
      );

    const newRecipient = await RecipientsService.create({
      lawyerId: id,
      details: {
        accountNumber: account_number,
        bankCode: bank_code,
        accountName: account_name,
        bankName: bank_name,
      },
    });

    return res.status(201).send({
      success: true,
      message: "recipient successfully created",
      recipient: newRecipient,
    });
  };

  async getRecipients(req, res, next) {
    const {
      decodedToken: { id },
    } = req;
    const recipient = await RecipientsService.find(id);

    if (!recipient)
      return next(createError(404, `You don't have a recipient account kindly create one`));

    return res.status(200).send({
      success: true,
      message: `recipients successfully retrieved`,
      recipient,
    });
  }

  async recipientExists(req, res, next) {
    const {
      decodedToken: { id },
      params: { code },
    } = req;
    const recipient = await RecipientsService.findByCode({ lawyerId: id, code });

    if (!recipient)
      return next(
        createError(404, `Account details with code ${code} doesn\'t exist for user with id ${id}`)
      );

    req.oldRecipient = recipient;
    return next();
  }

  async deleteRecipient(req, res, next) {
    const {
      decodedToken: { id },
      oldRecipient,
    } = req;

    const recipient = await RecipientsService.delete(id, oldRecipient);

    return res.status(200).send({
      success: true,
      message: "account successfully deleted",
      recipient,
    });
  }

  async getBankCodes(req, res, next) {
    const { monnifyToken } = req;
    const { response } = await RecipientsService.findMany({ monnifyToken });

    return res.status(200).send({
      success: true,
      message: "bank codes successfully retrieved",
      response,
    });
  }

  checkAccessLawyer(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role },
      } = req;

      if (role !== "lawyer")
        return next(createError(401, "You do not have access to perform this operation"));

      return next();
    };
  }
}

export default RecipientsController.getInstance();
