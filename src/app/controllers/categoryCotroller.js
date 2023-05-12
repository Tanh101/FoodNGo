const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categoryController = {

    getCategoryByName: async (categoryNames) => {
        try {
            const categories = await Category.find({ name: { $in: categoryNames } });
            if (!categories) {
                return null;
            }
            const categoriesId = categories.map(category => category._id);
            return categoriesId;
        } catch (error) {
            return null;
        }
    },

    getAllProductsInCategory: async (req, res) => {
        try {
            const categories = await Category.find();
            const products = await Product.find();
            const result = categories.map(category => {
                const productsInCategory = products.filter(product => product.categories.includes(category._id));
                return {
                    ...category._doc,
                    products: productsInCategory
                }
            });
            return res.status(200).json({
                success: true,
                message: 'Get all products in category successfully',
                data: result
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
            const newCategory = new Category({ name });
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
    }

}

module.exports = categoryController;