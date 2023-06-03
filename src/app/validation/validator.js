const Joi = require("joi");

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const signupSchema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        name: Joi.string().required(),
        dob: Joi.date().required(),
        gender: Joi.string().required(),
        phone: Joi.string().required(),
        avatar: Joi.string(),
        location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).required(),
        }).required(),
        address: Joi.object().required(),
});

exports.validateSignup = validator(signupSchema);

    