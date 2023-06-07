const express = require('express');
const Product = require('../models/Product');
const { stat } = require('fs');
const Category = require('../models/Category');
const categoryController = require('./categoryCotroller');

const productController = {
    createProduct: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const { name, price, description, media, categories } = req.body;
            const categoryIDs = await categoryController.getCategoryByName(categories);
            const newProduct = new Product({
                name: name,
                price: price,
                description: description,
                media: media,
                categories: categoryIDs,
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
    getAllProducts: async (req, res) => {
        try {
            const status = req.query.status;
            let products = [];
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            let totalProducts = 0;
            if (status) {
                totalProducts = await Product.countDocuments({ restaurant: req.user.userId, status: status });
                products = await Product.find({ restaurant: req.user.userId, status: status })
                    .skip((page - 1) * limit).limit(limit);
            }
            else {
                totalProducts = await Product.countDocuments({ restaurant: req.user.userId });
                products = await Product.find({ restaurant: req.user.userId })
                    .skip((page - 1) * limit).limit(limit);
            }
            
            const totalPages = Math.ceil(totalProducts / limit);
            const pagination = {
                totalPages: totalPages,
                currentPage: page,
                totalProducts: totalProducts
            }
            return res.status(200).json({
                success: true,
                message: 'Get all products successfully',
                products,
                pagination
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    getProductById: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Get product successfully',
                product
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch product'
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