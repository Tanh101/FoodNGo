const Joi = require('joi');

const ShipperValidator = (data) => {
    const shipperSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        gender: Joi.string(),
        avatar: Joi.string(),
        idNumber: Joi.string().required(),
        status: Joi.string().required(),
        rate: Joi.number(),
        account: Joi.string().required(),
        deleteAt: Joi.date(),

    });
    return shipperSchema.validate(data);
}

module.exports = ShipperValidator;