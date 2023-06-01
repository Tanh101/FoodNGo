const express = require('express');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const restaurantService = require('../../service/restaurantService');
const Account = require('../models/Account');
const Category = require('../models/Category');

const restaurantController = {
    getProductsByRestaurantId: async (req, res) => {
        try {
            const status = req.query.status || 'active';
            let tmp = null;
            if (status) {
                const restaurant = await Restaurant.findById(req.params.id);
                if (restaurant) {
                    const categories = await Product.distinct('categories', { restaurant: req.params.id, status: status });
                    const productList = await Product.find({ restaurant: req.params.id, status: status });
                    if (productList) {
                        const resultPromises = categories.map(async category => {
                            const categoryInfoPromise = Category.findById(category);
                            const products = productList.filter(product => product.categories.includes(category));
                            const categoryInfo = await categoryInfoPromise;
                            return {
                                category: categoryInfo,
                                products: products
                            };
                        });

                        const result = await Promise.all(resultPromises);

                        return res.status(200).json({
                            success: true,
                            message: 'Get products successfully',
                            result: result,
                        });

                    } else {
                        return res.status(404).json({
                            success: false,
                            message: "Product not found",
                            result
                        })
                    }
                } else {
                    return res.status(404).json({
                        success: false,
                        message: 'Restaurant not found',
                    });
                }
            }

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getAllRestaurants: async (req, res) => {
        let restaurants = null;
        let pagination = null;
        try {
            const isUpdated = await restaurantService.updateOpeningStatus();
            if(isUpdated){
                const longitude = req.query.longitude;
                const latitude = req.query.latitude;

                if (longitude && latitude) {
                    restaurants = await restaurantService.findNearbyRestaurants(req, res);
                    pagination = await restaurantService.getPagingData(req, res);
                    if (restaurants && pagination) {
                        return res.json({
                            success: true,
                            message: 'Get all restaurants successfully',
                            restaurants,
                            pagination,
                        });
                    }
                    else {
                        return res.status(404).json({
                            success: false,
                            message: 'Restaurant not found',
                        });
                    }
                }
                else {
                    restaurants = await Restaurant.find({ status: 'online' });
                    return res.json({
                        success: true,
                        message: 'Get all restaurants successfully',
                        restaurants
                    });
                }
            }else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update openingHours status of Restaurants'
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getRestaurantById: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            if (restaurant.status === 'pending' || restaurant.status === 'deleted') {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }

            return res.json({
                success: true,
                message: 'Get restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    //update status to offline
    updateRestaurantStatus: async (req, res) => {
        try {
            const status = req.body.status;
            if (status !== 'offline' || status !== 'online' || status !== 'deleted') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }

            const restaurant = await Restaurant.findOne({ _id: req.params.id });
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            restaurant.status = status;
            await restaurant.save();
            return res.json({
                success: true,
                message: 'Delete restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        //update status
    },

    updateRestaurantById: async (req, res) => {
        try {
            const { name, address, location, openingHours, categories, media, url, phone, description, rate, status } = req.body;
            const restaurant = await Restaurant.
                findByIdAndUpdate(req.user.userId, {
                    name,
                    address,
                    location,
                    openingHours,
                    categories,
                    media,
                    url,
                    phone,
                    description,
                    rate,
                    status
                }, { new: true });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Update restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

}

module.exports = restaurantController;

