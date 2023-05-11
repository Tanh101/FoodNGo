const express = require('express');
const Product = require('../models/Product');
const { stat } = require('fs');

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

    //get all products of a restaurant but with status
    getProductsByRestaurantId: async (req, res) => {
        try {
            const status = req.query.status;
            if (status) {
                const products = await Product.find({ restaurant: req.user.userId, status: status });
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
                });
            }
            const products = await Product.find({ restaurant: req.user.userId });
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
    },

    updateProduct: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const productId = req.params.id;
            const product = await Product.findOne({ _id: productId });
            if (restaurantId != product.restaurant) {
                return res.status(401).json({
                    success: false,
                    message: 'You are not authorized to update this product'
                });
            }
            const { name, price, description, media, category } = req.body;
            req.body.status ? product.status = req.body.status : product.status = 'active';
            product.name = name;
            product.price = price;
            product.description = description;
            product.media = media;
            product.category = category;
            await product.save();
            return res.status(200).json({
                success: true,
                message: 'Update product successfully',
                product,
            });


        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const { status } = req.body;
            const productId = req.params.id;
            const product = await Product.findOne({ _id: productId });
            if (restaurantId != product.restaurant) {
                return res.status(401).json({
                    success: false,
                    message: 'You are not authorized to update this product'
                });
            }
            product.status = 'deleted';
            product.deleteAt = Date.now();
            await product.save();
            return res.status(200).json({
                success: true,
                message: 'Delete product successfully',
                product,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

}

module.exports = productController;