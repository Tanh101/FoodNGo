
const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');
const { AVERAGE_DELIVERY_SPPED, PREPARING_TIME } = require('../utils/constants');
const Category = require('../app/models/Category');
const moment = require('moment-timezone');

const restaurantService = {

    checkOpeningHours: (open, close) => {
        try {
            moment.tz.setDefault('Asia/Ho_Chi_Minh');
            const [openHours, openMinutes] = open.split(':');
            const [closeHours, closeMinutes] = close.split(':');

            const openTime = new Date();
            openTime.setHours(openHours);
            openTime.setMinutes(openMinutes);

            const closeTime = new Date();
            closeTime.setHours(closeHours);
            closeTime.setMinutes(closeMinutes);

            const currentTime = new Date();
            if (currentTime >= openTime && currentTime < closeTime) {
                return true;
            }
            return false;

        } catch (error) {
            return false;
        }
    },

    updateOpeningStatus: async () => {
        try {
            const restaurants = await Restaurant.find();
            for (const restaurant of restaurants) {
                const { open, close } = restaurant.openingHours;
                const isOpening = restaurantService.checkOpeningHours(open, close);
                if (isOpening) {
                    restaurant.status = 'open';
                } else {
                    restaurant.status = 'close';
                }
                await restaurant.save();
            }
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },


    getPagingData: async (req, res) => {
        try {
            const longitude = req.query.longitude;
            const category = req.query.category;
            const latitude = req.query.latitude;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            const coordinates = [longitude, latitude].map(parseFloat);

            let allRestaurants = null;
            if (category) {
                allRestaurants = await Restaurant.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: 'Point',
                                coordinates
                            },
                            key: 'location',
                            maxDistance: parseFloat(20000),
                            distanceField: 'dist.calculated',
                            spherical: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categories',
                            foreignField: '_id',
                            as: 'categories'
                        }
                    },
                    {
                        $match: {
                            'categories.name': category
                        }
                    }
                ]);
            } else {
                allRestaurants = await Restaurant.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: 'Point',
                                coordinates
                            },
                            key: 'location',
                            maxDistance: parseFloat(20000),
                            distanceField: 'dist.calculated',
                            spherical: true
                        }
                    }
                ]);
            }

            const totalPage = Math.ceil(allRestaurants.length / limit);
            const totalResult = allRestaurants.length;
            const pagination = {
                totalPage,
                totalResult,
                currentPage: page
            }
            return pagination;
        } catch (error) {
            return null;
        }
    },

    findNearbyRestaurants: async (req, res) => {
        try {
            const category = req.query.category;
            const longitude = req.query.longitude;
            const latitude = req.query.latitude;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            const coordinates = [longitude, latitude].map(parseFloat);
            let restaurants = null;
            if (category) {
                restaurants = await Restaurant.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: 'Point',
                                coordinates
                            },
                            key: 'location',
                            maxDistance: parseFloat(20000),
                            distanceField: 'dist.calculated',
                            spherical: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categories',
                            foreignField: '_id',
                            as: 'categories'
                        }
                    },
                    {
                        $match: {
                            'categories.name': category
                        }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]);
            } else {
                restaurants = await Restaurant.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: 'Point',
                                coordinates
                            },
                            key: 'location',
                            maxDistance: parseFloat(20000),
                            distanceField: 'dist.calculated',
                            spherical: true
                        }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]);
            }

            const restaurantWithDeliveryTime = restaurants.map(restaurant => {
                const distance = restaurant.dist.calculated;
                const deliveryTime = distance ? (distance * 60 / (1000 * AVERAGE_DELIVERY_SPPED) + PREPARING_TIME) : 0;

                return {
                    ...restaurant,
                    deliveryTime,
                };
            });
            return restaurantWithDeliveryTime;

        } catch (error) {
            console.error(error);
            return null;
        }
    },

    createRestaurant: async (req, res, idAccount) => {
        try {
            let { name, address, location, media, url, phone, description, rate, openingHours, categories } = req.body;
            const restaurant = await Restaurant.findOne({ phone });
            if (restaurant) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
            if (categories.length > 1) {
                categories = categories.split(',');
            }
            const categoryIds = await Promise.all(
                categories.map(async (category) => {
                    const result = await Category.findOne({ name: category });
                    return result ? result._id : null;
                })
            );
            const newRestaurant = new Restaurant({
                name,
                address,
                location,
                openingHours,
                categories: categoryIds,
                media,
                url,
                phone,
                description,
                rate,
                account: idAccount
            });
            const savedRestaurant = await newRestaurant.save();
            return savedRestaurant;
        } catch (error) {
            console.error(error);
            return null;
        }
    },


    getRestaurantByAccount: async (req, res) => {
        try {
            const restaurant = await Restaurant.findOne({ account: req.params.id });
            return res.json(restaurant);
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch restaurant'
            });
        }
    }


};

module.exports = restaurantService;