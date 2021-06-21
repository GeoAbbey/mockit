import debug from "debug";
import createError from "http-errors";
import axios from "axios";
import { payStack } from "../../../utils/paymentService";

import PaymentsService from "../services/payment.services";
import { walletPay, subscriptionPay, singleInvitationPay, singleSmallClaimPay } from "./helpers";

const log = debug("app:payments-controller");

// const { initializePayment, verifyPayment, payment.chargeCard } =
const payment = payStack(axios);
class PaymentsController {
  static instance;
  static getInstance() {
    if (!PaymentsController.instance) {
      PaymentsController.instance = new PaymentsController();
    }

    return PaymentsController.instance;
  }

  async walletOrSubPayment(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body: { modelId, modelType },
      params: { code = undefined },
      decodedToken,
    } = req;
    log(`creating a Payment for user with id ${decodedToken.id}`);
    const payment = await PaymentsService.create(
      {
        id: decodedToken.id,
        modelId,
        modelType,
        code,
      },
      eventEmitter,
      decodedToken
    );

    if (!payment.success) return next(createError(400, `${payment.message}`));
    return res.status(201).send({
      success: true,
      message: "payment successfully created",
      payment: payment.service,
    });
  }

  processPayment = async (req, res, next) => {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { ref },
      decodedToken
    } = req;
    const result = await payment.verifyPayment(ref);
    const {
      response: { data },
    } = result;

    if (data.status !== "success")
      return next(createError(400, "There was an error processing your payment kindly try again"));

    const paymentResult = await PaymentsService.processPayIn({
      data,
      eventEmitter,
      decodedToken
    });

    return res.status(200).send(paymentResult);
  };

  cardPayment = async (req, res, next) => {
    const {
      body: { quantity = undefined, amount = undefined, type, modelId = undefined, authCode },
      decodedToken: { email, firstName, lastName, id },
    } = req;

    const mapper = {
      subscription: () =>
        this.handleSubscriptionCardPayIn({
          email,
          firstName,
          lastName,
          id,
          authCode,
          quantity,
          type,
        }),
      wallet: () =>
        this.handleWalletOrCooperateCardPayIn({
          email,
          firstName,
          lastName,
          id,
          authCode,
          amount,
          type,
        }),
      singleInvitation: () =>
        this.handleSingleInvitationCardPayIn({
          email,
          firstName,
          lastName,
          id,
          modelId,
          type,
          authCode,
        }),
      singleSmallClaim: () =>
        this.handleSingleSmallClaimCardPayIn({
          email,
          firstName,
          lastName,
          id,
          modelId,
          type,
          authCode,
        }),
      cooperate: () =>
        this.handleWalletOrCooperateCardPayIn({
          email,
          firstName,
          lastName,
          id,
          authCode,
          amount,
          type,
        }),
    };

    const result = await mapper[type]();

    if (!result.success) return next(createError(400, result));
    return res.status(200).send(result.response);
  };

  async handleWalletOrCooperateCardPayIn(args) {
    let data = walletPay(args);

    if (data.success === false) return data;
    data = { ...data, authorization_code: args.authCode };
    return payment.chargeCard(data);
  }

  async handleSubscriptionCardPayIn(args) {
    let data = subscriptionPay(args);

    if (data.success === false) return data;
    data = { ...data, authorization_code: args.authCode };
    return payment.chargeCard(data);
  }

  async handleSingleInvitationCardPayIn(args) {
    let data = await singleInvitationPay(args);

    if (data.success === false) return data;
    data = { ...data, authorization_code: args.authCode };
    return payment.chargeCard(data);
  }

  async handleSingleSmallClaimCardPayIn(args) {
    let data = await singleSmallClaimPay(args);

    if (data.success === false) return data;
    data = { ...data, authorization_code: args.authCode };
    return payment.chargeCard(data);
  }

  payInPayment = async (req, res, next) => {
    const {
      body: { quantity = undefined, amount = undefined, type, modelId },
      decodedToken: { email, firstName, lastName, id },
    } = req;

    const mapper = {
      subscription: () => this.handleSubscriptionPayIn({ quantity, email, id, type }),
      wallet: () =>
        this.handleWalletOrCooperatePayIn({ amount, email, firstName, lastName, id, type }),
      singleInvitation: () =>
        this.handleSingleInvitationPayIn({ email, firstName, lastName, id, modelId, type }),
      singleSmallClaim: () =>
        this.handleSingleSmallClaimPayIn({ email, firstName, lastName, id, modelId, type }),
      cooperate: () =>
        this.handleWalletOrCooperatePayIn({ email, firstName, lastName, id, amount, type }),
    };

    const result = await mapper[type]();

    if (!result.success) return next(createError(400, result));
    return res.status(200).send(result.response);
  };

  async handleSubscriptionPayIn(args) {
    const data = subscriptionPay(args);

    if (data.success === false) return data;
    return payment.initializePayment(data);
  }

  async handleWalletOrCooperatePayIn(args) {
    const data = walletPay(args);

    if (data.success === false) return data;
    return payment.initializePayment(data);
  }

  async handleSingleInvitationPayIn(args) {
    const data = await singleInvitationPay(args);

    if (data.success === false) return data;
    return payment.initializePayment(data);
  }

  async handleSingleSmallClaimPayIn(args) {
    const data = await singleSmallClaimPay(args);

    if (data.success === false) return data;
    return payment.initializePayment(data);
  }
}

export default PaymentsController.getInstance();
