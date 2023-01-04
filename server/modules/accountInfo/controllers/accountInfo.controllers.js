import debug from "debug";
import createError from "http-errors";

import AccountInfosService from "../services/accountInfo.services";
const log = debug("app:AccountInfos-controller");

class AccountInfosController {
  static instance;
  static getInstance() {
    if (!AccountInfosController.instance) {
      AccountInfosController.instance = new AccountInfosController();
    }

    return AccountInfosController.instance;
  }

  async createAccountInfo(req, res, next) {
    const {
      params: { ownerId },
    } = req;
    log(`creating an account info for user with id ${ownerId}`);
    const accountInfo = await AccountInfosService.create({ id: ownerId });

    return res.status(201).send({
      success: true,
      message: "Account information successfully created",
      accountInfo,
    });
  }

  accountInfoOperation(context) {
    return async (req, res, next) => {
      const {
        params: { ownerId, info },
        body,
        oldAccountInfo,
      } = req;
      log(`creating a account info for user with id ${ownerId}`);

      const DTO = { ...body, info, operation: context };

      const [, [accountInfo]] = await AccountInfosService.update(ownerId, DTO, oldAccountInfo);

      return res.status(201).send({
        success: true,
        message: `${info} successfully ${context}ed`,
        accountInfo,
      });
    };
  }

  accountInfoExits(context) {
    return async (req, res, next) => {
      const { ownerId } = req.params;
      log(`verifying that an account info with id ${ownerId} exits`);
      const accountInfo = await AccountInfosService.find(ownerId);
      if (!accountInfo) return next(createError(404, "The account info can not be found"));
      req.oldAccountInfo = accountInfo;
      return next();
    };
  }

  async getAccountInfoBalance(req, res, next) {
    const { oldAccountInfo } = req;

    return res.status(200).send({
      success: true,
      message: "account info successfully retrieved",
      accountInfo: oldAccountInfo,
    });
  }

  checkAccessAdmin(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      else return next(createError(401, "You are not permitted to access this route"));
    };
  }

  checkAccessUser(context) {
    return async (req, res, next) => {
      const {
        decodedToken: { role, id },
        params: { ownerId },
      } = req;
      if (role === "admin" || role === "super-admin") return next();
      if (role === "user" && id !== ownerId) {
        return next(createError(401, `You do not have access to ${context} this review`));
      }
      return next();
    };
  }
}

export default AccountInfosController.getInstance();
