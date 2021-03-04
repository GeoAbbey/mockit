import Joi from "joi";

export const createUserSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(8).max(30).required(),
  role: Joi.string().valid("user", "lawyer"),
});

export const updateUserSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email({ minDomainSegments: 2 }),
  password: Joi.string().min(8).max(30),
  notification: Joi.boolean(),
  isAccountSuspended: Joi.boolean(),
  isSubscribed: Joi.boolean(),
  isVerified: Joi.boolean(),
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
    }),
    surety: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email({ minDomainSegments: 2 }),
      phone: Joi.string(),
    }),
  }),
  profilePic: Joi.string(),
  creditCard: Joi.string().creditCard(),
  lawyerDocuments: Joi.object().keys({
    isLawyerVerified: Joi.boolean(),
  }),
  hasAgreedToTerms: Joi.boolean(),
  role: Joi.string().valid("user", "lawyer", "admin"),
});

export const validateUUID = Joi.object().keys({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const loginUserSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(8).max(30).required(),
});
