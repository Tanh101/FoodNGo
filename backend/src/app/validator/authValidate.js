const joi = require('joi');

const registerValidate = (data) => {
    const schema = joi.object({
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required(),
        role: joi.string().min(6).required().default('guest'),
        delete_at: joi.date().default(null),
        name: joi.string().required(),
        dob: joi.date().required(),
        gender: joi.string().required(),
        phone: joi.string().required().phone(),
        avatar: joi.string().default(null),
        location: joi.object({
            type: joi.string().required(),
            coordinates: joi.array().required()
        }),
        address: joi.objectId(),

    });
    return schema.validate(data);
}