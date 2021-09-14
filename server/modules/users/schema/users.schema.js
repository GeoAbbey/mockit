import Joi from "joi";

export const createUserSchema = Joi.object().keys({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().trim().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(6).max(30).required(),
  phone: Joi.string(),
  role: Joi.string().valid("user", "lawyer"),
  gender: Joi.string().valid("male", "female").required(),
});

export const createAnAdminSchema = createUserSchema.append({
  role: Joi.string().valid("user", "lawyer", "admin"),
  password: Joi.string().min(6).max(30),
});

export const updateUserSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  notification: Joi.boolean(),
  isAccountSuspended: Joi.boolean(),
  isSubscribed: Joi.boolean(),
  firebaseToken: Joi.string(),
  address: {
    residential: Joi.object().keys({
      country: Joi.string(),
      state: Joi.string(),
      street: Joi.string(),
    }),
    work: Joi.object().keys({
      country: Joi.string(),
      state: Joi.string(),
      street: Joi.string(),
    }),
    preferredLocation: Joi.object().keys({
      country: Joi.string(),
      state: Joi.string(),
      street: Joi.string(),
    }),
  },
  phone: Joi.string(),
  dob: Joi.date(),
  guarantors: Joi.object().keys({
    nextOfKin: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email({ minDomainSegments: 2 }),
      phone: Joi.string(),
      dob: Joi.date(),
      address: Joi.string(),
      gender: Joi.string().valid("male", "female").required(),
      profilePic: Joi.string(),
    }),
    surety: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email({ minDomainSegments: 2 }),
      phone: Joi.string(),
      dob: Joi.date(),
      address: Joi.string(),
      gender: Joi.string().valid("male", "female").required(),
      profilePic: Joi.string(),
    }),
  }),
  profilePic: Joi.string(),
  creditCard: Joi.string().creditCard(),
  lawyer: Joi.object().keys({
    isVerified: Joi.boolean(),
    description: Joi.string(),
    documents: Joi.object(),
  }),

  hasAgreedToTerms: Joi.boolean(),
  role: Joi.string().valid("user", "lawyer", "admin"),
});

export const validOTP = Joi.object().keys({
  otp: Joi.string().required(),
});

export const validOtpAndPassword = Joi.object().keys({
  otp: Joi.number().required(),
  newPassword: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
});

export const loginUserSchema = Joi.object().keys({
  email: Joi.string().trim().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().trim().required(),
});

export const newOTP = Joi.object().keys({
  for: Joi.string().valid("reset-password", "verify-email"),
});

export const queryOptions = Joi.object().keys({
  search: Joi.object().keys({
    role: Joi.string().valid("user", "lawyer", "admin", "super-admin"),
    name: Joi.string(),
    gender: Joi.string().valid("male", "female"),
  }),
  paginate: Joi.object().keys({
    page: Joi.number().min(1),
    pageSize: Joi.number().max(20),
  }),
});

export const changePasswordSchema = Joi.object().keys({
  password: Joi.string().required(),
  newPassword: Joi.string().required(),
});
