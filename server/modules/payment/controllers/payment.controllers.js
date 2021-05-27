import debug from "debug";
import createError from "http-errors";

import PaymentsService from "../services/payment.services";
const log = debug("app:payments-controller");

class PaymentsController {
  static instance;
  static getInstance() {
    if (!PaymentsController.instance) {
      PaymentsController.instance = new PaymentsController();
    }

    return PaymentsController.instance;
  }

  async makePayment(req, res, next) {
    const {
      body: { modelId, modelType },
      decodedToken: { id },
    } = req;
    log(`creating a Payment for user with id ${id}`);
    const payment = await PaymentsService.create({
      id,
      modelId,
      modelType,
    });

    if (!payment.success) return next(createError(400, `${payment.message}`));
    return res.status(201).send({
      success: true,
      message: "payment successfully created",
      payment: payment.service,
    });
  }
}

export default PaymentsController.getInstance();
