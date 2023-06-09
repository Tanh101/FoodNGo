const Joi = require('joi');

const ShipperValidator = (data) => {
    const shipperSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        gender: Joi.string(),
        avatar: Joi.string(),
        idNumber: Joi.string().required(),
        location: Joi.object().required(),
        address: Joi.object().required(),
        deleteAt: Joi.date(),


    });
    return shipperSchema.validate(data);
}

module.exports = ShipperValidator;