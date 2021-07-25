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

  async findByPk(id) {
    debugLog(`retrieving a user with id ${id}`);
    return models.User.findByPk(id);
  }

  async findOne(email) {
    debugLog(`retrieving a user with email ${email}`);
    return models.User.findOne({
      where: { email },
    });
  }

  async retrieveAll(filter, pageDetails) {
    debugLog(`retrieving all user on the platform using ${JSON.stringify(filter)}`);

    return models.User.findAndCountAll({ where: { ...filter }, ...paginate(pageDetails) });
  }

  async update(id, UserDTO, oldDetails) {
    debugLog(`updating a user with id ${id}`);
    const { address, guarantors, lawyer, profilePic } = oldDetails;
    const handleDocuments = (recent, old) => {
      console.log({ recent, old }, "🥶");
      return {
        lawSchoolCertificate: recent.lawSchoolCertificate || old.lawSchoolCertificate,
        universityCertificate: recent.universityCertificate || old.universityCertificate,
        votersCard: recent.votersCard || old.votersCard,
        nationalIDCard: recent.nationalIDCard || old.nationalIDCard,
        driversLicence: recent.driversLicence || old.driversLicence,
        internationalPassport: recent.internationalPassport || old.internationalPassport,
        others: recent.others || old.others,
      };
    };

    return models.User.update(
      {
        notification: handleFalsy(UserDTO.notification, oldDetails.notification),
        isVerified: handleFalsy(UserDTO.isVerified, oldDetails.isVerified),
        isAccountSuspended: handleFalsy(UserDTO.isAccountSuspended, oldDetails.isAccountSuspended),
        firstName: UserDTO.firstName || oldDetails.firstName,
        lastName: UserDTO.lastName || oldDetails.lastName,
        email: UserDTO.email || oldDetails.email,
        password: UserDTO.password || oldDetails.password,
        role: UserDTO.role || oldDetails.role,
        gender: UserDTO.gender || oldDetails.gender,
        isSubscribed: handleFalsy(UserDTO.isSubscribed, oldDetails.isSubscribed),
        firebaseToken: UserDTO.firebaseToken || oldDetails.firebaseToken,
        otp: {
          value: (UserDTO.otp && UserDTO.otp.value) || oldDetails.otp.value,
          expiresIn: (UserDTO.otp && UserDTO.otp.expiresIn) || oldDetails.otp.expiresIn,
        },
        address: {
          residential:
            (UserDTO.address && UserDTO.address.residential) ||
            (address && address.residential) ||
            null,
          work: (UserDTO.address && UserDTO.address.work) || (address && address.work) || null,
          preferredLocation:
            (UserDTO.address && UserDTO.address.preferredLocation) ||
            (address && address.preferredLocation) ||
            null,
        },
        phone: UserDTO.phone || oldDetails.phone,
        dob: UserDTO.dob || oldDetails.dob,
        guarantors: {
          nextOfKin: {
            firstName:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.firstName) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.firstName) ||
              null,
            lastName:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.lastName) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.lastName) ||
              null,
            email:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.email) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.email) ||
              null,
            phone:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.phone) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.phone) ||
              null,
            dob:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.dob) ||
              (guarantors && guarantors.dob && guarantors.nextOfKin.dob) ||
              null,
            address:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.address) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.address) ||
              null,
            profilePic:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.profilePic) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.profilePic) ||
              null,
            gender:
              (UserDTO.guarantors &&
                UserDTO.guarantors.nextOfKin &&
                UserDTO.guarantors.nextOfKin.gender) ||
              (guarantors && guarantors.nextOfKin && guarantors.nextOfKin.gender) ||
              null,
          },
          surety: {
            firstName:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.firstName) ||
              (guarantors && guarantors.surety && guarantors.surety.firstName) ||
              null,
            lastName:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.lastName) ||
              (guarantors && guarantors.surety && guarantors.surety.lastName) ||
              null,
            email:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.email) ||
              (guarantors && guarantors.surety && guarantors.surety.email) ||
              null,
            phone:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.phone) ||
              (guarantors && guarantors.surety && guarantors.surety.phone) ||
              null,
            dob:
              (UserDTO.guarantors && UserDTO.guarantors.surety && UserDTO.guarantors.surety.dob) ||
              (guarantors && guarantors.dob && guarantors.surety.dob) ||
              null,
            address:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.address) ||
              (guarantors && guarantors.surety && guarantors.surety.address) ||
              null,
            profilePic:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.profilePic) ||
              (guarantors && guarantors.surety && guarantors.surety.profilePic) ||
              null,
            gender:
              (UserDTO.guarantors &&
                UserDTO.guarantors.surety &&
                UserDTO.guarantors.surety.gender) ||
              (guarantors && guarantors.surety && guarantors.surety.gender) ||
              null,
          },
        },
        profilePic: UserDTO.profilePic || profilePic,
        lawyer: {
          isVerified: UserDTO.lawyer && handleFalsy(UserDTO.lawyer.isVerified, lawyer.isVerified),
          description: (UserDTO.lawyer && UserDTO.lawyer.description) || lawyer.description,
          documents:
            UserDTO.lawyer && UserDTO.lawyer.documents
              ? handleDocuments(UserDTO.lawyer.documents, lawyer.documents)
              : lawyer.documents,
        },
        hasAgreedToTerms: handleFalsy(UserDTO.hasAgreedToTerms, oldDetails.hasAgreedToTerms),
      },
      { where: { id }, returning: true }
    );
  }
}

export default UsersService.getInstance();
