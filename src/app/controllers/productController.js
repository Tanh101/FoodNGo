const express = require('express');
const Product = require('../models/Product');

const productController = {
    createProduct: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const { name, price, description, media, category } = req.body;
            const newProduct = new Product({
                name: name,
                price: price,
                description: description,
                media: media,
                category: category,
                restaurant: restaurantId
            })
            await newProduct.save();
            return res.json({
                success: true,
                message: 'Create product successfully',
                newProduct,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

    },

    getProductsByRestaurantId: async (req, res) => {
        try {
            const products = await Product.find({ restaurant: req.params.id });
            if (!products) {
                return res.status(404).json({
                    success: false,
                    message: 'Products not found',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Get products successfully',
                products,
            })
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch products'
            });
        }
    }
}

module.exports = productController;