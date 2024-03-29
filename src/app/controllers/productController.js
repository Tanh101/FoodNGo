const express = require('express');
const Product = require('../models/Product');
const { stat } = require('fs');
const Category = require('../models/Category');
const categoryController = require('./categoryCotroller');

const productController = {
    createProduct: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const { name, price, description, media, category } = req.body;
            const isValidCategory = await Category.findById({ restaurant: restaurantId, _id: category });
            if (!isValidCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category is not valid'
                });
            }
            const isValidName = await Product.findOne({ restaurant: restaurantId, name: name });
            if (isValidName && isValidName.status == 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Product name is already exist'
                });
            }
            if (isValidName && isValidName.status != 'active') {
                isValidName.status = 'active';
                isValidName.deleteAt = null;
                await isValidName.save();
                return res.status(200).json({
                    success: true,
                    message: 'Restore product successfully',
                    product: isValidName
                });
            }
            const newProduct = new Product({
                name: name,
                price: price,
                description: description,
                media: media,
                category,
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
            const status = req.query.status || 'active';
            let products = [];
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            let totalProducts = 0;
            totalProducts = await Product.countDocuments({ restaurant: req.user.userId, status: status });
            products = await Product.find({ restaurant: req.user.userId, status: status })
                .skip((page - 1) * limit).limit(limit).sort({ updatedAt: 1 });

            const productWithCategory = await Promise.all(products.map(async (product) => {
                const category = await Category.findById(product.category);
                return {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    media: product.media,
                    category: category,
                    restaurant: product.restaurant,
                    status: product.status,
                    deleteAt: product.deleteAt,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                }
            }));
            const totalPages = Math.ceil(totalProducts / limit);
            const pagination = {
                totalPages: totalPages,
                currentPage: page,
                totalProducts: totalProducts
            }
            return res.status(200).json({
                success: true,
                message: 'Get all products successfully',
                products: productWithCategory,
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
            const category = await Category.findById(product.category);
            const pro = {
                _id: product._id,
                name: product.name,
                price: product.price,
                description: product.description,
                media: product.media,
                category: category,
                restaurant: product.restaurant,
                status: product.status,
                deleteAt: product.deleteAt,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }
            return res.status(200).json({
                success: true,
                message: 'Get product successfully',
                product: pro
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
            const isExistName = await Product.findOne({ restaurant: restaurantId, name: name });
            if (isExistName && isExistName.status == 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Product name is already exist'
                });
            }

            if (isExistName && isExistName.status != 'active') {
                isExistName.name = name;
                isExistName.price = price;
                isExistName.description = description;
                isExistName.media = media;
                isExistName.category = category;
                isExistName.status = 'active';
                isExistName.deleteAt = null;
                await isExistName.save();
                await product.save();
                return res.status(200).json({
                    success: true,
                    message: 'Restore product successfully',
                    product: isExistName
                });
            }
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
            const productId = req.params.id;
            const product = await Product.findOne({ _id: productId });
            if (restaurantId != product.restaurant) {
                return res.status(401).json({
                    success: false,
                    message: 'You are not authorized to delete this product'
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