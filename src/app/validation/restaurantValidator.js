const Joi = require('joi');

const RestaurantValidator = (data) => {
    const restaurantSchema = Joi.object({
        name: Joi.string().required(),
        address: Joi.object({
            street: Joi.string(),
            province: Joi.string(),
            district: Joi.string(),
            commute: Joi.string()
        }),
        location: Joi.object({
            coordinates: Joi.array().required()
        }),
        media: Joi.array().items(Joi.object({
            type: Joi.string(),
            url: Joi.string()
        })),
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