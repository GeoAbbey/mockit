import debug from "debug";
import createError from "http-errors";
import axios from "axios";
import { payStack } from "../../../utils/paymentService";

import PaymentsService from "../services/payment.services";
import {
  walletPay,
  subscriptionPay,
  singleInvitationPay,
  singleSmallClaimPay,
  mileStonePay,
} from "./helpers";
import { paginate as pagination } from "../../helpers";
import { Op } from "sequelize";

const env = process.env.NODE_ENV || "development";
import configOptions from "../../../config/config";

const config = configOptions[env];

const log = debug("app:payments-controller");

const payment = payStack(axios);
class PaymentsController {
  static instance;
  static getInstance() {
    if (!PaymentsController.instance) {
      PaymentsController.instance = new PaymentsController();
    }

    return PaymentsController.instance;
  }

  async priceList(req, res, next) {
    const prices = await PaymentsService.priceList();

    return res.status(200).send({
      success: true,
      message: "all prices successfully returned",
      prices,
    });
  }

  async payInHistory(req, res, next) {
    const {
      filter,
      query: { paginate = {} },
    } = req;
    const history = await PaymentsService.payInHistory(filter, paginate);

    const { offset, limit } = pagination(paginate);
    return res.status(201).send({
      success: true,
      message: "history successfully retrieved",
      history: {
        currentPage: offset / limit + 1,
        pageSize: limit,
        ...history,
      },
    });
  }

  queryContext(req, res, next) {
    const {
      decodedToken: { role, id },
      query,
    } = req;

    let filter = {};

    const commonOptions = () => {
      if (query.search && query.search.ticketId) {
        filter = { ...filter, ticketId: { [Op.iLike]: `%${query.search.ticketId}%` } };
      }

      if (query.search && query.search.for) {
        filter = { ...filter, for: query.search.for };
      }
    };

    if (role === "admin" || role === "super-admin") {
      if (query.search && query.search.ownerId) {
        filter = { ...filter, ownerId: query.search.ownerId };
      }

      commonOptions();
    }

    if (role === "user" || role === "lawyer") {
      filter = { ...filter, ownerId: id };

      commonOptions();
    }

    req.filter = filter;
    return next();
  }

  async walletOrSubPayment(req, res, next) {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      body: { modelId, modelType, lawyerId = undefined, amount = undefined, quantity = undefined },
      params: { code = undefined },
      decodedToken,
    } = req;
    log(`creating a Payment for user with id ${decodedToken.id}`);
    const payment = await PaymentsService.create(
      {
        id: decodedToken.id,
        modelId,
        quantity,
        lawyerId,
        amount,
        modelType,
        code,
      },
      eventEmitter,
      decodedToken
    );

    if (!payment.success) return next(createError(400, `${payment.message}`));
    return res.status(201).send({
      success: true,
      message: payment.message ? payment.message : "payment successfully created",
      payment: payment.service,
    });
  }

  processPayment = async (req, res, next) => {
    const eventEmitter = req.app.get("eventEmitter");

    const {
      params: { ref },
      decodedToken,
      monnifyToken,
    } = req;

    console.log("I was here");
    const result = await payment.verifyPayment(ref, { monnifyToken });

    const {
      response: { responseBody: data },
    } = result;

    if (data && data.paymentStatus !== "PAID")
      return next(createError(400, "There was an error processing your payment kindly try again"));

    const paymentResult = await PaymentsService.processPayIn({
      data,
      eventEmitter,
      decodedToken,
    });

    return res.status(200).send(paymentResult);
  };

  cardPayment = async (req, res, next) => {
    const {
      body: {
        quantity = undefined,
        amount = undefined,
        type,
        modelId = undefined,
        authCode,
        lawyerId = undefined,
      },
      decodedToken: { email, firstName, lastName, id },
      monnifyToken,
    } = req;

    const mapper = {
      subscription: () =>
        this.handleSubscriptionCardPayIn({
          monnifyToken,
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
          monnifyToken,
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
          monnifyToken,
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
          monnifyToken,
          email,
          firstName,
          lastName,
          id,
          lawyerId,
          modelId,
          type,
          authCode,
        }),
      cooperate: () =>
        this.handleWalletOrCooperateCardPayIn({
          monnifyToken,
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
    data = { ...data, cardToken: args.authCode };
    return payment.chargeCard(data);
  }

  async handleSubscriptionCardPayIn(args) {
    let data = subscriptionPay(args);

    if (data.success === false) return data;
    data = { ...data, cardToken: args.authCode };
    return payment.chargeCard(data);
  }

  async handleSingleInvitationCardPayIn(args) {
    let data = await singleInvitationPay(args);

    if (data.success === false) return data;
    data = { ...data, cardToken: args.authCode };
    return payment.chargeCard(data);
  }

  async handleSingleSmallClaimCardPayIn(args) {
    let data = await singleSmallClaimPay(args);

    if (data.success === false) return data;
    data = { ...data, cardToken: args.authCode };
    return payment.chargeCard(data);
  }

  payInPayment = async (req, res, next) => {
    const {
      body: {
        quantity = undefined,
        amount = undefined,
        type,
        modelId,
        callback_url = undefined,
        lawyerId = undefined,
      },
      decodedToken: { email, firstName, lastName, id },
      monnifyToken,
    } = req;

    const mapper = {
      subscription: () =>
        this.handleSubscriptionPayIn({
          quantity,
          email,
          id,
          firstName,
          lastName,
          type,
          callback_url,
          monnifyToken,
        }),
      mileStone: () =>
        this.handleMileStonePayIn({
          modelId,
          email,
          id,
          firstName,
          lastName,
          type,
          callback_url,
          monnifyToken,
        }),
      wallet: () =>
        this.handleWalletOrCooperatePayIn({
          monnifyToken,
          amount,
          email,
          firstName,
          lastName,
          id,
          type,
          callback_url,
        }),
      singleInvitation: () =>
        this.handleSingleInvitationPayIn({
          monnifyToken,
          email,
          firstName,
          lastName,
          id,
          modelId,
          type,
          callback_url,
        }),
      singleSmallClaim: () =>
        this.handleSingleSmallClaimPayIn({
          monnifyToken,
          email,
          firstName,
          lastName,
          lawyerId,
          id,
          modelId,
          type,
          callback_url,
        }),
      cooperate: () =>
        this.handleWalletOrCooperatePayIn({
          monnifyToken,
          email,
          firstName,
          lastName,
          id,
          amount,
          type,
          callback_url,
        }),
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

  async handleMileStonePayIn(args) {
    const data = await mileStonePay(args);

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
