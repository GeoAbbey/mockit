import Joi from "joi";

export const createUserSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(6).max(30).required(),
  phone: Joi.string()
    .pattern(/^(0|\+234)\d{10}$/)
    .required(),
  role: Joi.string().valid("user", "lawyer"),
  gender: Joi.string().valid("male", "female").required(),
});

export const updateUserSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  notification: Joi.boolean(),
  isAccountSuspended: Joi.boolean(),
  isSubscribed: Joi.boolean(),
  firebaseToken: Joi.string(),
  address: {
    residential: Joi.string(),
    work: Joi.string(),
    preferredLocation: Joi.string(),
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
  otp: Joi.number().required(),
});

export const validOtpAndPassword = Joi.object().keys({
  otp: Joi.number().required(),
  newPassword: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
});

export const loginUserSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});

export const newOTP = Joi.object().keys({
  for: Joi.string().valid("reset-password", "verify-email"),
});

export const queryUserOrLawyer = Joi.object().keys({
  role: Joi.string().valid("user", "lawyer", "admin", "super-admin"),
});

export const changePasswordSchema = Joi.object().keys({
  password: Joi.string().required(),
  newPassword: Joi.string().required(),
});
