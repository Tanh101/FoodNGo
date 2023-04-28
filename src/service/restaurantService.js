const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');

const restaurantService = {
    findNearbyRestaurants: async (req, res) => {
        try {
            // Lấy vị trí từ query parameter
            const location = req.body.location;
            const coordinates = location.split(',').map(coord => parseFloat(coord));

            // Tìm kiếm các nhà hàng gần vị trí người dùng trong cơ sở dữ liệu
            const restaurants = await Restaurant.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: 3000 // Bán kính tìm kiếm (đơn vị: mét)
                    }
                }
            });

            // Gửi danh sách các nhà hàng làm phản hồi của API
            return res.json(restaurants);
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch restaurants'
            });
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
    }
    

};

module.exports = restaurantService;