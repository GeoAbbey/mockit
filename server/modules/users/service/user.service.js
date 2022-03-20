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
    console.log({ UserDTO });

    const { address, emergencyContact, lawyer, profilePic } = oldDetails;
    const handleDocuments = (recent, old) => ({
      link: recent.link || old.link,
    });

    return models.User.update(
      {
        notification: handleFalsy(UserDTO.notification, oldDetails.notification),
        isVerified: handleFalsy(UserDTO.isVerified, oldDetails.isVerified),
        isAccountSuspended: handleFalsy(UserDTO.isAccountSuspended, oldDetails.isAccountSuspended),
        firstName: UserDTO.firstName || oldDetails.firstName,
        lastName: UserDTO.lastName || oldDetails.lastName,
        email: UserDTO.email || oldDetails.email,
        password: UserDTO.password || oldDetails.password,
        description: UserDTO.description || oldDetails.description,
        role: UserDTO.role || oldDetails.role,
        gender: UserDTO.gender || oldDetails.gender,
        isSubscribed: handleFalsy(UserDTO.isSubscribed, oldDetails.isSubscribed),
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
        phone: UserDTO.phone || oldDetails.phone,
        dob: UserDTO.dob || oldDetails.dob,
        emergencyContact: {
          profilePic:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.profilePic) ||
            (emergencyContact && emergencyContact.profilePic) ||
            null,
          firstName:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.firstName) ||
            (emergencyContact && emergencyContact.firstName) ||
            null,
          lastName:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.lastName) ||
            (emergencyContact && emergencyContact.lastName) ||
            null,
          email:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.email) ||
            (emergencyContact && emergencyContact.email) ||
            null,
          phone:
            (UserDTO.emergencyContact && UserDTO.emergencyContact.phone) ||
            (emergencyContact && emergencyContact.phone) ||
            null,
        },
        profilePic: UserDTO.profilePic || profilePic,
        lawyer: {
          isVerified: (UserDTO.lawyer && UserDTO.lawyer.isVerified) || lawyer.isVerified,
          supremeCourtNumber: UserDTO.supremeCourtNumber || lawyer.supremeCourtNumber,
          typeOfDocument: UserDTO.typeOfDocument || lawyer.typeOfDocument,
          isSubscribed:
            UserDTO.lawyer && handleFalsy(UserDTO.lawyer.isSubscribed, lawyer.isSubscribed),
          documents:
            UserDTO.lawyer && UserDTO.lawyer.documents
              ? handleDocuments(UserDTO.lawyer.documents, lawyer.documents)
              : lawyer.documents,
        },
        hasAgreedToTerms: handleFalsy(UserDTO.hasAgreedToTerms, oldDetails.hasAgreedToTerms),
      },
      { where: { id }, returning: true, ...t }
    );
  }
}

export default UsersService.getInstance();
