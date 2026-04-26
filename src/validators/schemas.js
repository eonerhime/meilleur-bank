const Joi = require("joi");

exports.registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  kycType: Joi.string().valid("bvn", "nin").required(),
  kycId: Joi.string().length(11).required(),
  dob: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.transferSchema = Joi.object({
  toAccount: Joi.string().length(10).required(),
  amount: Joi.number().positive().required(),
  narration: Joi.string().optional(),
});
