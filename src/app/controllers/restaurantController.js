const express = require('express');
const geolib = require('geolib');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const restaurantService = require('../../service/restaurantService');
const Account = require('../models/Account');
const Category = require('../models/Category');
const { ACCOUNT_STATUS_PENDING, AVERAGE_DELIVERY_SPPED, PREPARING_TIME } = require('../../utils/constants');
const { getAllProducts } = require('./productController');

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
            if (isUpdated) {
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
            } else {
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
            let result = null;
            const { longitude, latitude } = req.query;
            const isUpdated = await restaurantService.updateOpeningStatus();
            if (!isUpdated) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update openingHours status of Restaurants'
                });
            }
            const targetCoordinate = {
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude)
            };
            if (!longitude || !latitude) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid longitude or latitude',
                });
            }
            const restaurant = await Restaurant.findById(req.params.id);
            const categories = await Product.distinct('categories', { restaurant: req.params.id });
            const productList = await Product.find({ restaurant: req.params.id });
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

                result = await Promise.all(resultPromises);
            }
            const restaurantCoordinate = {
                longitude: parseFloat(restaurant.location.coordinates[0]),
                latitude: parseFloat(restaurant.location.coordinates[1])
            };
            if (!restaurant || restaurant.status === ACCOUNT_STATUS_PENDING) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            let distance = geolib.getDistance(restaurantCoordinate, targetCoordinate);
            distance = parseFloat(distance.toFixed(2));
            const deliveryTime = distance ? (distance * 60 /
                (1000 * AVERAGE_DELIVERY_SPPED) + PREPARING_TIME) : 0;
            return res.json({
                success: true,
                message: 'Get restaurant successfully',
                restaurant: {
                    result,
                    ...restaurant._doc,
                    distance,
                    deliveryTime
                }
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
            const restaurantId = req.user.userId;
            const status = req.query;
            if (status || status !== 'open' || status !== 'close' || status !== 'deleted') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }

            const restaurant = await Restaurant.findOne({ _id: restaurantId });
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
                message: 'Update restaurant status successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    updateRestaurantById: async (req, res) => {
        try {
            const { name, address, location, openingHours, categories, media, phone, description, status } = req.body;
            const restaurant = await Restaurant.
                findByIdAndUpdate(req.user.userId, {
                    name,
                    location,
                    address,
                    media,
                    phone,
                    description,
                    status,
                    openingHours,
                    categories
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


    //dashboard restaurant

    getInforRestaurant: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.user.userId);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            const account = await Account.find({ _id: restaurant.account });
            const { password, ...accountWithouPassword } = account[0]._doc;
            return res.status(200).json({
                success: true,
                message: 'Get restaurant successfully',
                restaurant,
                account: accountWithouPassword
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
            const products = await Product.find({ restaurant: req.user.userId });
            if (!products) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Get all products successfully',
                products,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = restaurantController;

