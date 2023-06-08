const Joi = require('joi');

const ShipperValidator = (data) => {
    const ShipperSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
    });
    return restaurantSchema.validate(data);
}

module.exports = ShipperValidator;