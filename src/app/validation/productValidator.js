const Joi = require('joi');

const ProductValidator = (data) => {
    const ProductSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        description: Joi.string().required(),
        media: Joi.array().items({
            type: Joi.string().required(),
            url: Joi.string().required()
        }),
        category: Joi.string().required(),
    });
    return ProductSchema.validate(data);
}

module.exports = { ProductValidator };