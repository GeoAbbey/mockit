import debug from "debug";

import models from "../../../models";
import { QueryTypes } from "sequelize";
import { handleFalsy } from "../../../utils";
import { rawQueries } from "../../../utils/rawQueriers";
import { paginate } from "../../helpers";

const debugLog = debug("app:users-service");

class UsersService {
  static instance;
  static getInstance() {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  async create(UserDTO) {
    debugLog("creating a user");
    return models.User.create(UserDTO);
  }

  async noOfDistinctUsers() {
    debugLog("returning data for different types users");
    return models.sequelize.query(rawQueries.noOfDistinctUsers(), {
      type: QueryTypes.SELECT,
    });
  }

  async noOfActiveUsers() {
    debugLog("returning data for different types users");
    return models.sequelize.query(rawQueries.noOfActiveUsers(), {
      type: QueryTypes.SELECT,
    });
  }

  async findByPk(id) {
    debugLog(`retrieving a user with id ${id}`);
    return models.User.findByPk(id);
  }

  async findOne(filter) {
    debugLog(`retrieving a user with email ${JSON.stringify(filter)}`);
    return models.User.findOne({
      where: { ...filter },
    });
  }

  async retrieveAll(filter, pageDetails) {
    debugLog(`retrieving all user on the platform using ${JSON.stringify(filter)}`);

    return models.User.findAndCountAll({ where: { ...filter }, ...paginate(pageDetails) });
  }

  async findMany(filter) {
    debugLog(`retrieving all user on the platform using ${JSON.stringify(filter)}`);

    return models.User.findAll({ where: { ...filter } });
  }

  async update(id, UserDTO, oldDetails, t = undefined) {
    debugLog(`updating a user with id ${id} 🍋`);
    const { address, emergencyContact, lawyer, profilePic, settings } = oldDetails;

    const handleDocuments = (recent, old) => ({
      link: recent.link || old.link,
    });

    return models.User.update(
      {
        settings: {
          notification: {
            email:
              UserDTO.settings && UserDTO.settings.notification
                ? handleFalsy(UserDTO.settings.notification.email, settings.notification.email)
                : settings.notification.email,
            phone:
              UserDTO.settings && UserDTO.settings.notification
                ? handleFalsy(UserDTO.settings.notification.phone, settings.notification.phone)
                : settings.notification.phone,
            inApp:
              UserDTO.settings && UserDTO.settings.notification
                ? handleFalsy(UserDTO.settings.notification.inApp, settings.notification.inApp)
                : settings.notification.inApp,
          },
          isSuspended: UserDTO.settings
            ? handleFalsy(UserDTO.settings.isSuspended, settings.isSuspended)
            : settings.isSuspended,
          isEmailVerified: UserDTO.settings
            ? handleFalsy(UserDTO.settings.isEmailVerified, settings.isEmailVerified)
            : settings.isEmailVerified,
          isPhone: {
            verified:
              UserDTO.settings && UserDTO.settings.isPhone
                ? handleFalsy(UserDTO.settings.isPhone.verified, settings.isPhone.verified)
                : settings.isPhone.verified,
            pinId:
              (UserDTO.settings && UserDTO.settings.isPhone && UserDTO.settings.isPhone.pinId) ||
              settings.isPhone.pinId,
          },
          hasAgreedToTerms: UserDTO.settings
            ? handleFalsy(UserDTO.settings.hasAgreedToTerms, settings.hasAgreedToTerms)
            : settings.hasAgreedToTerms,
        },
        firstName: UserDTO.firstName || oldDetails.firstName,
        lastName: UserDTO.lastName || oldDetails.lastName,
        email: UserDTO.email || oldDetails.email,
        phone: UserDTO.phone || oldDetails.phone,
        dob: UserDTO.dob || oldDetails.dob,
        password: UserDTO.password || oldDetails.password,
        description: UserDTO.description || oldDetails.description,
        role: UserDTO.role || oldDetails.role,
        profilePic: UserDTO.profilePic || profilePic,
        gender: UserDTO.gender || oldDetails.gender,
        firebaseToken: UserDTO.firebaseToken || oldDetails.firebaseToken,
        otp: {
          value: (UserDTO.otp && UserDTO.otp.value) || oldDetails.otp.value,
          expiresIn: (UserDTO.otp && UserDTO.otp.expiresIn) || oldDetails.otp.expiresIn,
        },
        address: {
          country: (UserDTO.address && UserDTO.address.country) || address.country,
          state: (UserDTO.address && UserDTO.address.state) || address.state,
          residence: {
            work:
              (UserDTO.address && UserDTO.address.residence && UserDTO.address.residence.work) ||
              address.residence.work,
            home:
              (UserDTO.address && UserDTO.address.residence && UserDTO.address.residence.home) ||
              address.residence.home,
          },
        },
        emergencyContact: {
          firstName:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.firstName) ||
            emergencyContact.firstName,
          lastName:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.lastName) ||
            emergencyContact.lastName,
          email:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.email) || emergencyContact.email,
          phone:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.phone) || emergencyContact.phone,
        },
        lawyer: {
          isVerified: UserDTO.lawyer
            ? handleFalsy(UserDTO.lawyer.isVerified, lawyer.isVerified)
            : lawyer.isVerified,
          supremeCourtNumber:
            (UserDTO.lawyer && UserDTO.lawyer.supremeCourtNumber) || lawyer.supremeCourtNumber,
          typeOfDocument:
            (UserDTO.lawyer && UserDTO.lawyer.typeOfDocument) || lawyer.typeOfDocument,
          oneTimeSubscription: UserDTO.lawyer
            ? handleFalsy(UserDTO.lawyer.oneTimeSubscription, lawyer.oneTimeSubscription)
            : lawyer.oneTimeSubscription,
          documents:
            UserDTO.lawyer && UserDTO.lawyer.documents
              ? handleDocuments(UserDTO.lawyer.documents, lawyer.documents)
              : lawyer.documents,
        },
      },
      { where: { id }, returning: true, ...t }
    );
  }
}

export default UsersService.getInstance();
