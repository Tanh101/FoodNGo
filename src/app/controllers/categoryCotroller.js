const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categoryController = {

    getAllCategoryByRestaurant: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const categories = await Category.find({restaurant: restaurantId});
            return res.status(200).json({
                success: true,
                message: 'Get all categories successfully',
                categories
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getAllProductsInCategory: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find();

            const limit = req.query.limit || 10;
            const currentPage = req.query.page || 1;

            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;

            const result = categories.map(category => {
                const productsInCategory = products
                    .filter(product => product.categories.includes(category._id))
                    .slice(startIndex, endIndex);
                return {
                    ...category._doc,
                    products: productsInCategory
                }
            });

            const totalProductsCount = result.reduce((count, category) => count + category.products.length, 0);

            const totalPages = Math.ceil(totalProductsCount / limit);

            return res.status(200).json({
                success: true,
                message: 'Get all products in category successfully',
                data: {
                    result,
                    currentPage,
                    totalPages,
                    limit,
                    totalProductsCount
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            const category = await Category.findOne({ name });
            if (category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category already exists'
                });
            }
            const newCategory = new Category({ name, restaurant: req.user.userId });
            await newCategory.save();
            return res.status(201).json({
                success: true,
                message: 'Create category successfully',
                data: newCategory
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    updateCategory: async (req, res) => {
        try {
            const { status, name } = req.body;
            const id = req.params.id;
            const category = await Category.findById(id);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            if(!status || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }
            const result = await Category.findByIdAndUpdate(id, { status, name }, { new: true });
            return res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                category: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


}

module.exports = categoryController;