const Joi = require('joi');

const RestaurantValidator = (data) => {
    const restaurantSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        name: Joi.string().required(),
        location: Joi.object({
            type: Joi.string().required(),
            coordinates: Joi.array().required()
        }).required(),
        openingHours: Joi.object().required(),
        media: Joi.array().items(Joi.object({
            type: Joi.string(),
            url: Joi.string()
        })),
        address: Joi.string().required(),
        phone: Joi.string().required(),
        description: Joi.string(),
        categories: Joi.array(),
    });
    return restaurantSchema.validate(data);
}

module.exports = RestaurantValidator;