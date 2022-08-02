import Joi from "joi";

export const createUserSchema = Joi.object().keys({
  firstName: Joi.string().trim().required(),
  phone: Joi.string().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().trim().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(6).max(30).required(),
  gender: Joi.string().valid("male", "female"),
  role: Joi.string().valid("user", "lawyer"),
});

export const createAnAdminSchema = createUserSchema.append({
  role: Joi.string().valid("user", "lawyer", "admin"),
  password: Joi.string().min(6).max(30),
});

export const adminUpdateUser = Joi.object().keys({
  role: Joi.string().valid("user", "lawyer", "admin"),
  lawyer: Joi.object().keys({
    isVerified: Joi.string().valid("initiated", "in-progress", "completed", "declined"),
  }),
  settings: Joi.object().keys({
    isSuspended: Joi.boolean(),
  }),
});

export const updateUserSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  settings: Joi.object().keys({
    hasAgreedToTerms: Joi.boolean(),
    notification: Joi.object().keys({
      email: Joi.boolean(),
      inApp: Joi.boolean(),
      phone: Joi.boolean(),
    }),
  }),
  gender: Joi.string().valid("male", "female"),
  firebaseToken: Joi.string(),
  description: Joi.string(),
  address: {
    state: Joi.string(),
    country: Joi.string(),
    residence: Joi.object().keys({
      home: Joi.string(),
      work: Joi.string(),
    }),
  },
  dob: Joi.date(),
  emergencyContact: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    phone: Joi.string(),
  }),
  profilePic: Joi.string(),
  lawyer: Joi.object().keys({
    isVerified: Joi.string().valid("initiated", "in-progress", "completed", "declined"),
    documents: Joi.object(),
    typeOfDocument: Joi.string(),
    supremeCourtNumber: Joi.string(),
  }),
});

export const validOTP = Joi.object().keys({
  otp: Joi.string().required(),
});

export const validPIN = Joi.object().keys({
  pin: Joi.string().required(),
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
    phone: Joi.string(),
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
