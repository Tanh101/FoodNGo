const Joi = require('joi');

const RestaurantValidator = (data) => {
    const restaurantSchema = Joi.object({
        name: Joi.string().required(),
        location: Joi.object({
            coordinates: Joi.array().required()
        }),
        openingHours: Joi.array().items(Joi.string()),
        media: Joi.array().items(Joi.object({
            type: Joi.string(),
            url: Joi.string()
        })),
        address: Joi.string().required(),
        url: Joi.string().required(),
        phone: Joi.string().required(),
        description: Joi.string(),
        rate: Joi.number().required(),
        status: Joi.string().required(),
        delete_at: Joi.date()
    });
    return restaurantSchema.validate(data);
}

module.exports = RestaurantValidator;