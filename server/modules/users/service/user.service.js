import models from "../../../models";
import debug from "debug";

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

  async findByPk(id) {
    debugLog(`retrieving a user with email ${id}`);
    return models.User.findByPk(id);
  }

  async findOne(email) {
    debugLog(`retrieving a user with email ${email}`);
    return models.User.findOne({ where: { email } });
  }

  async update(id, UserDTO, oldDetails) {
    debugLog(`updating a user with id ${id}`);
    const { address, guarantors, lawyerDocuments } = oldDetails;
    return models.User.update(
      {
        notification: UserDTO.notification || oldDetails.notification,
        isEmailVerified: UserDTO.notification || oldDetails.isVerified,
        isAccountSuspended: UserDTO.isAccountSuspended || oldDetails.isAccountSuspended,
        firstName: UserDTO.firstName || oldDetails.firstName,
        lastName: UserDTO.lastName || oldDetails.lastName,
        email: UserDTO.email || oldDetails.email,
        password: UserDTO.password || oldDetails.password,
        role: UserDTO.role || oldDetails.role,
        isSubscribed: UserDTO.isSubscribed || oldDetails.isSubscribed,
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
          },
        },
        profilePic: UserDTO.profilePic || oldDetails.profilePic,
        creditCard: UserDTO.creditCard || oldDetails.creditCard,
        lawyerDocuments: {
          isLawyerVerified:
            (UserDTO.lawyerDocuments && UserDTO.lawyerDocuments.isLawyerVerified) ||
            (lawyerDocuments && lawyerDocuments.isLawyerVerified) ||
            null,
        },
        hasAgreedToTerms: UserDTO.hasAgreedToTerms || oldDetails.hasAgreedToTerms,
      },
      { where: { id }, returning: true }
    );
  }
}

export default UsersService.getInstance();