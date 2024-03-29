
const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');
const { AVERAGE_DELIVERY_SPPED, PREPARING_TIME } = require('../utils/constants');
const Category = require('../app/models/Category');
const moment = require('moment-timezone');

const restaurantService = {


    checkOpeningHours: (open, close) => {
        try {
            const currentTime = moment().tz('Asia/Ho_Chi_Minh');
            const openTime = moment(open, 'HH:mm');
            const closeTime = moment(close, 'HH:mm');
            console.log(currentTime, openTime, closeTime);
            const isWithinOpeningHours = currentTime.isSameOrAfter(openTime) && currentTime.isBefore(closeTime);
            return isWithinOpeningHours;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    updateOpeningStatus: async () => {
        try {
            const restaurants = await Restaurant.find();
            for (const restaurant of restaurants) {
                const { open, close } = restaurant.openingHours;
                const isOpening = restaurantService.checkOpeningHours(open, close);
                console.log(isOpening);
                if (restaurant.status !== 'pending' && restaurant.status !== 'deleted') {
                    if (isOpening && restaurant.status.toString() === 'close') {
                        restaurant.status = 'open';
                        await restaurant.save();
                    } else if(!isOpening && restaurant.status.toString() === 'open'){
                        restaurant.status = 'close';
                        await restaurant.save();
                    }
                }
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
                            'categories.name': category,
                            status: { $in: ['open', 'close'] }
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
                    },
                    {
                        $match: {
                            status: { $in: ['open', 'close'] }
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
                            'categories.name': category,
                            status: { $in: ['open', 'close'] }
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
                        $match: {
                            status: { $in: ['open', 'close'] }
                        }
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
            let { name, address, location, media, phone, description, openingHours, categories } = req.body;
            const restaurant = await Restaurant.findOne({ phone });
            if (restaurant) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }

            const newRestaurant = new Restaurant({
                name,
                address,
                location,
                openingHours,
                categories,
                media,
                phone,
                description,
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
    },

    findRestaurantByName: async (req, res) => {
        try {
            let restaurants = null;
            const isUpdated = await restaurantService.updateOpeningStatus();
            if (isUpdated) {
                const longitude = req.query.longitude;
                const latitude = req.query.latitude;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 9;
                const coordinates = [longitude, latitude].map(parseFloat);
                const searchKeyword = req.query.name;
                const regex = new RegExp(searchKeyword, 'i');
                console.log(regex);
                console.log(coordinates);
                if (longitude && latitude) {
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
                            $match: {
                                name: { $regex: regex },
                                status: { $in: ['open', 'close'] }
                            }
                        },
                        {
                            $sort: {
                                'dist.calculated': 1
                            }
                        },
                        {
                            $skip: (page - 1) * limit
                        },
                        {
                            $limit: limit
                        }
                    ]);
                    const totalResult = Object.keys(restaurants).length;
                    const totalPage = Math.ceil(totalResult / limit);
                    const pagination = {
                        totalResult,
                        currentPage: page,
                        totalPage
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
                }
            }
            return null;

        } catch (error) {
            return null;
        }

    }



};

module.exports = restaurantService;