const Joi = require("joi");

const UserValidator = (data) => {
    const userSchema = Joi.object({
        name: Joi.string().required(),
        dob: Joi.date().required(),
        gender: Joi.string().required(),
        phone: Joi.string().required(),
        avatar: Joi.string().default(null),
        location: Joi.object({
            coordinates: Joi.array().required()
        }),
        address: Joi.object({
            street: Joi.string(),
            province: Joi.string(),
            district: Joi.string(),
            commute: Joi.string()
        })
    });
    return userSchema.validate(data);
}

const AccountValidator = (data) => {
    const accountSchema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        role: Joi.string().required(),
    });
    return accountSchema.validate(data);
}

module.exports = {
    UserValidator,
    AccountValidator
}
