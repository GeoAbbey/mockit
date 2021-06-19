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

  async makeRecipient(req, res, next) {
    const {
      decodedToken: { firstName, lastName, id, email },
      body: { type, description, account_number, bank_code, currency },
    } = req;
    log(`creating a recipient for user with id ${id}`);

    const recipient = await payment.createRecipient({
      name: `${firstName} ${lastName}`,
      type,
      description,
      email,
      account_number,
      bank_code,
      currency,
    });

    if (!recipient.success) return next(createError(400, recipient.response));

    const { response: recipientFromPayStack } = recipient;
    console.log({ recipientFromPayStack }, "🐥🍅");

    const newRecipient = await RecipientsService.create({
      id,
      code: recipientFromPayStack.data.recipient_code,
      payStackId: recipientFromPayStack.data.id,
      details: recipientFromPayStack.data,
    });

    return res.status(201).send({
      success: true,
      message: "recipient successfully created",
      recipient: newRecipient,
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
