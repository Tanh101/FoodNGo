
const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');
const { AVERAGE_DELIVERY_SPPED, PREPARING_TIME } = require('../utils/constants');

const restaurantService = {

    getPagingData: async (req, res) => {
        try {
            const longitude = req.query.longitude;
            const latitude = req.query.latitude;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 18;
            const coordinates = [longitude, latitude].map(parseFloat);
            const allRestaurants = await Restaurant.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates
                        },
                        key: 'location',
                        maxDistance: parseFloat(5000),
                        distanceField: 'dist.calculated',
                        spherical: true
                    }
                },
                {
                    $match: {
                        status: 'online'
                    }
                }
            ]);

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
            const longitude = req.query.longitude;
            const latitude = req.query.latitude;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 18;
            const coordinates = [longitude, latitude].map(parseFloat);

            const restaurants = await Restaurant.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates
                        },
                        key: 'location',
                        maxDistance: parseFloat(5000),
                        distanceField: 'dist.calculated',
                        spherical: true
                    }
                },
                {
                    $match: {
                        status: 'open'
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ]);

            const restaurantWithDeliveryTime = restaurants.map(restaurant => {
                const distance = restaurant.dist.calculated;
                const deliveryTime = distance ? (distance * 60 / (1000 * AVERAGE_DELIVERY_SPPED) + PREPARING_TIME) : null;

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
            let { name, address, location, media, url, phone, description, rate, openingHours } = req.body;
            const restaurant = await Restaurant.findOne({ phone });
            if (restaurant) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
            const categories  = req.body.categories.split(',');
            const categoriesId = categories.map(category => mongoose.Types.ObjectId(category));
            const newRestaurant = new Restaurant({
                name,
                address,
                location,
                openingHours,
                categories: categoriesId,
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

    getRestaurantById: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            return res.json(restaurant);
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch restaurant'
            });
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