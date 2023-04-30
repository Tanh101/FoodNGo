
const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');

const restaurantService = {
    findNearbyRestaurants: async (req, res) => {
        try {
            // Lấy vị trí từ query parameter
            const longitude = req.query.longtitude;
            const latitude = req.query.latitude;


            const coordinates = [longitude, latitude].map(parseFloat);

            // Tìm kiếm các nhà hàng gần vị trí người dùng trong cơ sở dữ liệu
            const restaurants = await Restaurant.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates
                        },
                        key: 'location',
                        maxDistance: parseFloat(3000000),
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

            // Trả về kết quả
            return restaurants;

        } catch (error) {
            console.error(error);
            return null;

        }
    },

    createRestaurant: async (req, res, idAccount) => {
        try {
            let { name, address, location, media, url, phone, description, rate } = req.body;
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